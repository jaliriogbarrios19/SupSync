import { requestUrl, RequestUrlParam } from "obsidian";
import type { SupSyncSettings } from "./types";

let settings: SupSyncSettings;
let accessToken = "";
let refreshToken = "";
let currentUserId = "";

let persistTokens: ((access: string, refresh: string) => void) | null = null;

export function setSupabaseSettings(s: SupSyncSettings) {
    settings = s;
}

export function setAccessToken(token: string) {
    accessToken = token;
}

export function getAccessToken(): string {
    return accessToken;
}

export function setRefreshToken(token: string) {
    refreshToken = token;
}

export function getRefreshToken(): string {
    return refreshToken;
}

export function setCurrentUserId(id: string): void {
    currentUserId = id;
}

export function getCurrentUserId(): string {
    return currentUserId;
}

export function setPersistCallback(cb: (access: string, refresh: string) => void): void {
    persistTokens = cb;
}

function baseUrl(): string {
    if (!settings) throw new Error("Supabase settings not initialized");
    return `${settings.supabaseUrl}/rest/v1`;
}

function storageBaseUrl(): string {
    if (!settings) throw new Error("Supabase settings not initialized");
    return `${settings.supabaseUrl}/storage/v1`;
}

export function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: settings.supabaseAnonKey,
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
}

async function autoRefreshOn401(res: { status: number }): Promise<void> {
    if (res.status === 401 && refreshToken) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) throw new Error("Session expired. Please sign in again.");
    }
}

export async function supabaseGet<T>(
    path: string,
    query?: Record<string, string>,
): Promise<T> {
    const params = new URLSearchParams(query || {});
    const url = `${baseUrl()}/${path}?${params.toString()}`;
    let req: RequestUrlParam = { url, method: "GET", headers: authHeaders() };
    let res = await requestUrl(req);
    if (res.status === 401) {
        await autoRefreshOn401(res);
        req = { url, method: "GET", headers: authHeaders() };
        res = await requestUrl(req);
    }
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Supabase GET ${path}: ${res.status}`);
    }
    return res.json as T;
}

export async function supabasePost<T>(
    path: string,
    body: unknown,
    query?: Record<string, string>,
): Promise<T | null> {
    const params = new URLSearchParams(query || {});
    const url = `${baseUrl()}/${path}?${params.toString()}`;
    const prefer = params.has("on_conflict")
        ? "resolution=merge-duplicates, return=representation"
        : "return=representation";
    let req: RequestUrlParam = {
        url, method: "POST",
        headers: { ...authHeaders(), Prefer: prefer },
        body: JSON.stringify(body),
    };
    let res = await requestUrl(req);
    if (res.status === 401) {
        await autoRefreshOn401(res);
        req = {
            url, method: "POST",
            headers: { ...authHeaders(), Prefer: prefer },
            body: JSON.stringify(body),
        };
        res = await requestUrl(req);
    }
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Supabase POST ${path}: ${res.status} ${res.text}`);
    }
    if (res.json && Array.isArray(res.json) && (res.json as unknown[]).length > 0) {
        return (res.json as T[])[0];
    }
    return null;
}

export async function supabasePatch(
    path: string,
    body: unknown,
    query?: Record<string, string>,
): Promise<void> {
    const params = new URLSearchParams(query || {});
    const url = `${baseUrl()}/${path}?${params.toString()}`;
    let req: RequestUrlParam = {
        url, method: "PATCH",
        headers: { ...authHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify(body),
    };
    let res = await requestUrl(req);
    if (res.status === 401) {
        await autoRefreshOn401(res);
        req = {
            url, method: "PATCH",
            headers: { ...authHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify(body),
        };
        res = await requestUrl(req);
    }
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Supabase PATCH ${path}: ${res.status}`);
    }
}

export async function supabaseDelete(
    path: string,
    query?: Record<string, string>,
): Promise<void> {
    const params = new URLSearchParams(query || {});
    const url = `${baseUrl()}/${path}?${params.toString()}`;
    let req: RequestUrlParam = { url, method: "DELETE", headers: authHeaders() };
    let res = await requestUrl(req);
    if (res.status === 401) {
        await autoRefreshOn401(res);
        req = { url, method: "DELETE", headers: authHeaders() };
        res = await requestUrl(req);
    }
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Supabase DELETE ${path}: ${res.status}`);
    }
}

export function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 3,
): Promise<T> {
    return fn().catch((err) => {
        if (retries <= 0) throw err;
        const delay = Math.pow(2, 3 - retries) * 1000;
        return new Promise<T>((resolve) =>
            window.setTimeout(
                () => resolve(retryWithBackoff(fn, retries - 1)),
                delay,
            ),
        );
    });
}

// --- Auth ---

function saveTokens(access: string, refresh: string): void {
    accessToken = access;
    refreshToken = refresh;
    if (persistTokens) persistTokens(access, refresh);
}

export async function signUp(
    email: string,
    password: string,
): Promise<{ user: { id: string; email: string }; session: { access_token: string; refresh_token: string } } | null> {
    const url = `${settings.supabaseUrl}/auth/v1/signup`;
    const req: RequestUrlParam = {
        url, method: "POST",
        headers: { "Content-Type": "application/json", apikey: settings.supabaseAnonKey },
        body: JSON.stringify({ email, password }),
    };
    const res = await requestUrl(req);
    if (res.status < 200 || res.status >= 300) {
        const err = res.json as { msg?: string };
        throw new Error(err?.msg || `SignUp failed: ${res.status}`);
    }
    const data = res.json as {
        user: { id: string; email: string };
        session: { access_token: string; refresh_token: string } | null;
    };
    if (data.session) {
        saveTokens(data.session.access_token, data.session.refresh_token);
    }
    return data as { user: { id: string; email: string }; session: { access_token: string; refresh_token: string } };
}

export async function signIn(
    email: string,
    password: string,
): Promise<{
    access_token: string;
    refresh_token: string;
    user: { id: string; email: string };
}> {
    const url = `${settings.supabaseUrl}/auth/v1/token?grant_type=password`;
    const req: RequestUrlParam = {
        url, method: "POST",
        headers: { "Content-Type": "application/json", apikey: settings.supabaseAnonKey },
        body: JSON.stringify({ email, password }),
    };
    const res = await requestUrl(req);
    if (res.status < 200 || res.status >= 300) {
        const err = res.json as { error_description?: string };
        throw new Error(err?.error_description || `SignIn failed: ${res.status}`);
    }
    const data = res.json as {
        access_token: string;
        refresh_token: string;
        user: { id: string; email: string };
    };
    saveTokens(data.access_token, data.refresh_token);
    return data;
}

export async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken || !settings) return false;
    const url = `${settings.supabaseUrl}/auth/v1/token?grant_type=refresh_token`;
    try {
        const req: RequestUrlParam = {
            url, method: "POST",
            headers: { "Content-Type": "application/json", apikey: settings.supabaseAnonKey },
            body: JSON.stringify({ refresh_token: refreshToken }),
        };
        const res = await requestUrl(req);
        if (res.status < 200 || res.status >= 300) return false;
        const data = res.json as { access_token: string; refresh_token: string };
        saveTokens(data.access_token, data.refresh_token);
        return true;
    } catch {
        return false;
    }
}

export async function signOut(): Promise<void> {
    const url = `${settings.supabaseUrl}/auth/v1/logout`;
    const req: RequestUrlParam = {
        url, method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: settings.supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
        },
    };
    await requestUrl(req);
    saveTokens("", "");
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
    if (!accessToken) return null;
    const url = `${settings.supabaseUrl}/auth/v1/user`;
    const req: RequestUrlParam = {
        url, method: "GET",
        headers: {
            apikey: settings.supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
        },
    };
    const res = await requestUrl(req);
    if (res.status < 200 || res.status >= 300) {
        return null;
    }
    return res.json as { id: string; email: string };
}

// --- Storage helpers ---

export async function uploadToStorage(
    bucketName: string,
    storagePath: string,
    data: ArrayBuffer,
    contentType: string,
): Promise<{ Key: string }> {
    const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
    const url = `${storageBaseUrl()}/object/${bucketName}/${encoded}`;
    const req: RequestUrlParam = {
        url, method: "PUT",
        headers: {
            ...authHeaders(),
            "Content-Type": contentType,
        },
        body: data,
    };
    const res = await requestUrl(req);
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Storage upload failed: ${res.status}`);
    }
    return res.json as { Key: string };
}

export async function downloadFromStorage(
    bucketName: string,
    storagePath: string,
): Promise<ArrayBuffer> {
    const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
    const url = `${storageBaseUrl()}/object/${bucketName}/${encoded}`;
    const req: RequestUrlParam = { url, method: "GET", headers: authHeaders() };
    const res = await requestUrl(req);
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Storage download failed: ${res.status}`);
    }
    return res.arrayBuffer;
}

export async function deleteFromStorage(
    bucketName: string,
    storagePath: string,
): Promise<void> {
    const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
    const url = `${storageBaseUrl()}/object/${bucketName}/${encoded}`;
    const req: RequestUrlParam = { url, method: "DELETE", headers: authHeaders() };
    const res = await requestUrl(req);
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Storage delete failed: ${res.status}`);
    }
}
