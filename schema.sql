
-- PostgreSQL schema for Peida Lions System

CREATE TABLE members (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    line_uid TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('guest', 'member', 'officer', 'president', 'admin')) DEFAULT 'member',
    status TEXT CHECK (status IN ('pending', 'active', 'suspended', 'archived')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT,
    date DATE,
    location TEXT,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
    created_by UUID REFERENCES members(id),
    approved_by UUID REFERENCES members(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY,
    title TEXT,
    content TEXT,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
    created_by UUID REFERENCES members(id),
    approved_by UUID REFERENCES members(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    member_id UUID REFERENCES members(id),
    num_attendees INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    event_id UUID REFERENCES events(id),
    amount INTEGER,
    method TEXT,
    status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkins (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    member_id UUID REFERENCES members(id),
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT
);

CREATE TABLE message_logs (
    id UUID PRIMARY KEY,
    user_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_type TEXT,
    message_content TEXT,
    intent TEXT,
    action_taken TEXT,
    event_id UUID
);

CREATE TABLE files (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    filename TEXT,
    file_url TEXT,
    file_type TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES members(id),
    action TEXT,
    target_table TEXT,
    target_id UUID,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE liff_sessions (
    session_id TEXT PRIMARY KEY,
    line_uid TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT,
    ip_address TEXT
);
