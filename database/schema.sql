-- Link UIU Database (PostgreSQL / Supabase Schema)
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    program_level TEXT NOT NULL CHECK (program_level IN ('undergraduate', 'graduate')) DEFAULT 'undergraduate'
);

-- 2. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trimester TEXT NOT NULL UNIQUE
);

-- 3. Profiles Table (Main Institutional Identity)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    student_id TEXT UNIQUE,
    user_type TEXT CHECK (user_type IN ('alumni', 'student')) DEFAULT 'student',
    department_id UUID REFERENCES departments(id),
    dept TEXT,
    batch_id UUID REFERENCES batches(id),
    batch TEXT,
    job_title TEXT,
    company TEXT,
    location TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    achievements TEXT[] DEFAULT '{}',
    links JSONB DEFAULT '{}',
    email TEXT,
    phone TEXT,
    profile_photo TEXT,
    verified BOOLEAN DEFAULT FALSE,
    connections_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    job_type TEXT CHECK (job_type IN ('Full-time', 'Part-time', 'Hybrid', 'Remote')) DEFAULT 'Full-time',
    category TEXT,
    salary TEXT,
    description TEXT,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT CHECK (status IN ('Applied', 'Hired', 'Rejected')) DEFAULT 'Applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(job_id, applicant_id)
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    day TEXT, -- Pre-computed for UI
    month TEXT, -- Pre-computed for UI
    time TEXT,
    location TEXT,
    attendees_count INT DEFAULT 0,
    category TEXT,
    status TEXT CHECK (status IN ('upcoming', 'past')) DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Event Attendance
CREATE TABLE IF NOT EXISTS event_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(event_id, profile_id)
);

-- 8. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('job', 'system', 'connection')) DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ===================================================
-- AUTOMATION: AUTH TO PROFILE SYNC
-- ===================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, student_id, user_type, email, dept, education)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'user_type',
    new.email,
    new.raw_user_meta_data->>'dept',
    CASE 
      WHEN (new.raw_user_meta_data->>'user_type') = 'student' THEN 
        '[{"school": "United International University", "degree": "Undergraduate", "period": "2021 - Present", "grade": "Active"}]'::jsonb
      ELSE 
        '[]'::jsonb
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

-- Profiles: Public View, Self Edit
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Jobs: Public View, Alumni Insert, Owner Update/Delete
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs viewable by all" ON jobs FOR SELECT USING (true);
CREATE POLICY "Alumni can create jobs" ON jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'alumni')
);
CREATE POLICY "Owners can manage jobs" ON jobs FOR ALL USING (posted_by = auth.uid());

-- Messages: Only Sender/Receiver can see
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- Notifications: Only Recipient
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = profile_id);

-- ===================================================
-- 10. Posts Table (For Pulse Feed)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for Feed Performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date DESC);

INSERT INTO departments (name, program_level) VALUES 
('CSE (Computer Science & Engineering)', 'undergraduate'),
('EEE (Electrical & Electronic Engineering)', 'undergraduate'),
('BBA (Business Administration)', 'undergraduate'),
('CE (Civil Engineering)', 'undergraduate'),
('Data Science', 'undergraduate'),
('MBA (Master of Business Administration)', 'graduate'),
('MSCSE', 'graduate')
ON CONFLICT DO NOTHING;

INSERT INTO batches (trimester) VALUES 
('181'), ('182'), ('183'), ('191'), ('192'), ('193'), ('201'), ('202'), ('203'), ('211'), ('212'), ('213'), ('221'), ('222'), ('223'), ('231'), ('232'), ('233')
ON CONFLICT DO NOTHING;
