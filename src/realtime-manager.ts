import { authHeaders as getAuthHeaders } from "./supabase-client";
import { getAccessToken } from "./supabase-client";

type LockChangeCb = (path: string, userId: string | null, action: "acquired" | "released") => void;

interface RealtimeMsg {
    event: string;
    topic: string;
    payload: RealtimePayload;
    ref: string | null;
}

interface RealtimePayload {
    type?: string;
    record?: Record<string, unknown>;
    old_record?: Record<string, unknown>;
    columns?: unknown[];
    timestamp?: string;
    schema?: string;
    table?: string;
    commit_timestamp?: string;
    status?: string;
    response?: Record<string, unknown>;
    [key: string]: unknown;
}

const REALTIME_PATH = "/realtime/v1/websocket";
const PHX_CHANNEL = "realtime:public:locks";

export class RealtimeManager {
    private ws: WebSocket | null = null;
    private heartbeatTimer: number | null = null;
    private refCounter = 0;
    private supabaseUrl: string;
    private vaultId = "";
    private onLockChange: LockChangeCb;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;

    constructor(supabaseUrl: string, onLockChange: LockChangeCb) {
        this.supabaseUrl = supabaseUrl;
        this.onLockChange = onLockChange;
    }

    connect(vaultId: string): void {
        if (this.ws) this.disconnect();
        this.vaultId = vaultId;
        this.reconnectAttempts = 0;

        const wsUrl = this.supabaseUrl.replace(/^http/, "ws") + REALTIME_PATH;
        const apikey = getAuthHeaders()["apikey"] || "";
        const token = getAccessToken();
        const params = new URLSearchParams({
            apikey,
            vsn: "1.0.0",
        });
        if (token) {
            params.set("token", token);
        }
        const fullUrl = `${wsUrl}?${params.toString()}`;

        this.ws = new WebSocket(fullUrl);

        this.ws.addEventListener("open", () => {
            this.reconnectAttempts = 0;
            this.sendJoin();
        });

        this.ws.addEventListener("message", (event) => {
            void this.handleMessage(event.data as string);
        });

        this.ws.addEventListener("close", () => {
            this.stopHeartbeat();
            if (!this.vaultId) return;
            this.reconnectAttempts++;
            if (this.reconnectAttempts > this.maxReconnectAttempts) return;
            const delay = Math.min(
                5000 * Math.pow(2, this.reconnectAttempts - 1),
                60000,
            );
            window.setTimeout(() => {
                this.connect(this.vaultId);
            }, delay);
        });

        this.ws.addEventListener("error", () => {
            // Reconnection handled by close event
        });
    }

    disconnect(): void {
        this.vaultId = "";
        this.reconnectAttempts = 0;
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private sendJoin(): void {
        if (!this.ws) return;
        const ref = String(++this.refCounter);
        this.ws.send(JSON.stringify({
            topic: PHX_CHANNEL,
            event: "phx_join",
            payload: {
                config: {
                    broadcast: { self: true },
                    presence: { key: "" },
                    postgres_changes: [
                        {
                            event: "INSERT",
                            schema: "public",
                            table: "locks",
                            filter: `vault_id=eq.${this.vaultId}`,
                        },
                        {
                            event: "DELETE",
                            schema: "public",
                            table: "locks",
                            filter: `vault_id=eq.${this.vaultId}`,
                        },
                    ],
                },
            },
            ref,
        }));
    }

    private async handleMessage(raw: string): Promise<void> {
        try {
            const msg = JSON.parse(raw) as RealtimeMsg;
            const { event, ref } = msg;

            if (event === "phx_reply" && ref) {
                if (msg.payload.status === "ok") {
                    this.startHeartbeat();
                }
                return;
            }

            if (event === "heartbeat") {
                this.sendHeartbeatReply();
                return;
            }

            if (event === "postgres_changes") {
                this.handlePostgresChange(msg.payload);
            }
        } catch {
            // Ignore malformed messages
        }
    }

    private handlePostgresChange(payload: RealtimePayload): void {
        const type = payload.type;
        if (!type) return;

        if (type === "INSERT" && payload.record) {
            const rec = payload.record as Record<string, unknown>;
            this.onLockChange(
                rec.path as string,
                rec.user_id as string,
                "acquired",
            );
        } else if (type === "DELETE" && payload.old_record) {
            const rec = payload.old_record as Record<string, unknown>;
            this.onLockChange(
                rec.path as string,
                null,
                "released",
            );
        }
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatTimer = window.setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                const ref = String(++this.refCounter);
                this.ws.send(JSON.stringify({
                    topic: "phoenix",
                    event: "heartbeat",
                    payload: {},
                    ref,
                }));
            }
        }, 30000);
    }

    private sendHeartbeatReply(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const ref = String(++this.refCounter);
            this.ws.send(JSON.stringify({
                topic: "phoenix",
                event: "heartbeat",
                payload: {},
                ref,
            }));
        }
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer !== null) {
            window.clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}
