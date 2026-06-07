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

-- 4. RLS Policies

-- vaults
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vaults_select" ON vaults
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "vaults_insert" ON vaults
    FOR INSERT WITH CHECK (true);

CREATE POLICY "vaults_update" ON vaults
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- vault_members
ALTER TABLE vault_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON vault_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vault_members vm
            WHERE vm.vault_id = vault_id AND vm.user_id = auth.uid()
        )
    );

CREATE POLICY "members_insert_self" ON vault_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_delete_admin" ON vault_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_members.vault_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = notes.vault_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "notes_insert_with_lock" ON notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = notes.vault_id AND user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM locks
            WHERE vault_id = notes.vault_id
            AND path = notes.path
            AND user_id = auth.uid()
            AND expires_at > now()
        )
    );

CREATE POLICY "notes_update_with_lock" ON notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = notes.vault_id AND user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM locks
            WHERE vault_id = notes.vault_id
            AND path = notes.path
            AND user_id = auth.uid()
            AND expires_at > now()
        )
    );

CREATE POLICY "notes_delete_with_lock" ON notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = notes.vault_id AND user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM locks
            WHERE vault_id = notes.vault_id
            AND path = notes.path
            AND user_id = auth.uid()
            AND expires_at > now()
        )
    );

-- locks
ALTER TABLE locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locks_select" ON locks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = locks.vault_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "locks_insert_no_conflict" ON locks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = locks.vault_id AND user_id = auth.uid()
        )
        AND user_id = auth.uid()
        AND NOT EXISTS (
            SELECT 1 FROM locks l
            WHERE l.vault_id = locks.vault_id
            AND l.path = locks.path
            AND l.expires_at > now()
        )
    );

CREATE POLICY "locks_update_owner" ON locks
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "locks_delete_owner" ON locks
    FOR DELETE USING (user_id = auth.uid());

-- vault_files
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select" ON vault_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_files.vault_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "files_insert_member" ON vault_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_files.vault_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "files_update_member" ON vault_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_files.vault_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "files_delete_member" ON vault_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM vault_members
            WHERE vault_id = vault_files.vault_id AND user_id = auth.uid()
        )
    );

-- 5. Trigger: vault creator becomes admin
CREATE OR REPLACE FUNCTION make_creator_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO vault_members (vault_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER vault_creator_is_admin
    AFTER INSERT ON vaults
    FOR EACH ROW EXECUTE FUNCTION make_creator_admin();

-- 6. Cleanup: expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM locks WHERE expires_at <= now();
END;
$$ LANGUAGE plpgsql;
