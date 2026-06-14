export const SETUP_SQL = `
-- SupSync: Supabase setup script
-- Run this in the Supabase SQL Editor after creating your project.

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tables

CREATE TABLE vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vault_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(vault_id, user_id)
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(vault_id, path)
);

CREATE TABLE locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(vault_id, path)
);

CREATE TABLE vault_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    hash TEXT DEFAULT '',
    storage_path TEXT NOT NULL,
    content_type TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(vault_id, path)
);

-- 3. Indexes

CREATE INDEX idx_notes_vault_path ON notes(vault_id, path);
CREATE INDEX idx_notes_updated ON notes(vault_id, updated_at);
CREATE INDEX idx_locks_vault_path ON locks(vault_id, path);
CREATE INDEX idx_locks_expires ON locks(expires_at);
CREATE INDEX idx_vault_files_vault ON vault_files(vault_id);
CREATE INDEX idx_vault_members_user ON vault_members(user_id);
CREATE INDEX idx_vault_members_vault ON vault_members(vault_id);

-- 4. Helper functions

-- Extract user UUID from JWT claims directly.
-- auth.uid() can return NULL when called from within a SECURITY DEFINER trigger,
-- so we read request.jwt.claims explicitly.
CREATE OR REPLACE FUNCTION supsync_uid()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT (
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb
        ->> 'sub'
    )::UUID;
$$;

-- Check vault membership without RLS recursion.
-- SECURITY DEFINER bypasses RLS so this can be used inside policy expressions
-- that would otherwise trigger infinite recursion on vault_members.
CREATE OR REPLACE FUNCTION is_vault_member(p_vault_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM vault_members
        WHERE vault_id = p_vault_id AND user_id = supsync_uid()
    );
END;
$$;

-- 5. RLS Policies

-- vaults
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vaults_select" ON vaults
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "vaults_insert" ON vaults
    FOR INSERT WITH CHECK (true);

CREATE POLICY "vaults_update" ON vaults
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = id
            AND user_id = supsync_uid()
            AND role = 'admin'
        )
    );

-- vault_members
ALTER TABLE vault_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON vault_members
    FOR SELECT USING (is_vault_member(vault_id) OR user_id = auth.uid());

CREATE POLICY "members_insert_self" ON vault_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_delete_admin" ON vault_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_members.vault_id
            AND user_id = supsync_uid()
            AND role = 'admin'
        )
    );

-- notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON notes
    FOR SELECT USING (is_vault_member(vault_id));

CREATE POLICY "notes_insert_member" ON notes
    FOR INSERT WITH CHECK (is_vault_member(vault_id));

CREATE POLICY "notes_update_member" ON notes
    FOR UPDATE USING (is_vault_member(vault_id));

CREATE POLICY "notes_delete_member" ON notes
    FOR DELETE USING (is_vault_member(vault_id));

-- locks
ALTER TABLE locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locks_select" ON locks
    FOR SELECT USING (is_vault_member(vault_id));

CREATE POLICY "locks_insert_no_conflict" ON locks
    FOR INSERT WITH CHECK (
        is_vault_member(vault_id)
        AND user_id = supsync_uid()
        AND NOT EXISTS (
            SELECT 1 FROM locks l
            WHERE l.vault_id = locks.vault_id
            AND l.path = locks.path
            AND l.expires_at > now()
        )
    );

CREATE POLICY "locks_update_owner" ON locks
    FOR UPDATE USING (user_id = supsync_uid());

CREATE POLICY "locks_delete_owner" ON locks
    FOR DELETE USING (user_id = supsync_uid());

-- vault_files
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select" ON vault_files
    FOR SELECT USING (is_vault_member(vault_id));

CREATE POLICY "files_insert_member" ON vault_files
    FOR INSERT WITH CHECK (is_vault_member(vault_id));

CREATE POLICY "files_update_member" ON vault_files
    FOR UPDATE USING (is_vault_member(vault_id));

CREATE POLICY "files_delete_member" ON vault_files
    FOR DELETE USING (is_vault_member(vault_id));

-- 6. Trigger: vault creator becomes admin
CREATE OR REPLACE FUNCTION make_creator_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO vault_members (vault_id, user_id, role)
    VALUES (NEW.id, supsync_uid(), 'admin');
    RETURN NEW;
END;
$$;

CREATE TRIGGER vault_creator_is_admin
    AFTER INSERT ON vaults
    FOR EACH ROW EXECUTE FUNCTION make_creator_admin();

-- 7. Cleanup: expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM locks WHERE expires_at <= now();
END;
$$;

-- 8. Grant table privileges to API roles
GRANT SELECT, INSERT, UPDATE, DELETE ON vaults TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_members TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON locks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_files TO anon, authenticated;
`;
