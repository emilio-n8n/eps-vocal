-- ============================================
-- CARNET NUMÉRIQUE SPORT - SCHEMA DATABASE
-- ============================================
-- Supabase PostgreSQL Schema
-- Version: 1.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  school_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  school_year TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_class_per_teacher UNIQUE(teacher_id, name, school_year)
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_student_per_class UNIQUE(class_id, first_name, last_name)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  general_notes TEXT,
  weather TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Attendance
CREATE TABLE session_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  is_present BOOLEAN NOT NULL DEFAULT true,
  absence_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_attendance_per_session UNIQUE(session_id, student_id)
);

-- Observations
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  processed_text TEXT,
  category TEXT CHECK (category IN ('performance', 'behavior', 'progress', 'difficulty', 'injury', 'general')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  keywords TEXT[],
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('session_summary', 'student_progress', 'class_report')),
  content JSONB NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Classes
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_school_year ON classes(school_year);

-- Students
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_name ON students(last_name, first_name);

-- Sessions
CREATE INDEX idx_sessions_class_id ON sessions(class_id);
CREATE INDEX idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX idx_sessions_date ON sessions(date DESC);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Session Attendance
CREATE INDEX idx_attendance_session_id ON session_attendance(session_id);
CREATE INDEX idx_attendance_student_id ON session_attendance(student_id);

-- Observations
CREATE INDEX idx_observations_session_id ON observations(session_id);
CREATE INDEX idx_observations_student_id ON observations(student_id);
CREATE INDEX idx_observations_timestamp ON observations(timestamp DESC);
CREATE INDEX idx_observations_category ON observations(category);
CREATE INDEX idx_observations_sentiment ON observations(sentiment);

-- Reports
CREATE INDEX idx_reports_session_id ON reports(session_id);
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_type ON reports(report_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES - CLASSES
-- ============================================

CREATE POLICY "Teachers can view own classes"
  ON classes FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes"
  ON classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- ============================================
-- RLS POLICIES - STUDENTS
-- ============================================

CREATE POLICY "Teachers can view students in their classes"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create students in their classes"
  ON students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update students in their classes"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete students in their classes"
  ON students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - SESSIONS
-- ============================================

CREATE POLICY "Teachers can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = teacher_id);

-- ============================================
-- RLS POLICIES - SESSION ATTENDANCE
-- ============================================

CREATE POLICY "Teachers can view attendance for their sessions"
  ON session_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_attendance.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance for their sessions"
  ON session_attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_attendance.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - OBSERVATIONS
-- ============================================

CREATE POLICY "Teachers can view observations from their sessions"
  ON observations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = observations.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create observations in their sessions"
  ON observations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = observations.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update observations in their sessions"
  ON observations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = observations.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete observations in their sessions"
  ON observations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = observations.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - REPORTS
-- ============================================

CREATE POLICY "Teachers can view reports from their sessions"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reports.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create reports for their sessions"
  ON reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reports.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete their reports"
  ON reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = reports.session_id
      AND sessions.teacher_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Classes
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Students
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sessions
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Observations
CREATE TRIGGER update_observations_updated_at
  BEFORE UPDATE ON observations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View: Classes with student count
CREATE VIEW classes_with_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT s.id) as student_count,
  COUNT(DISTINCT ses.id) as session_count
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
LEFT JOIN sessions ses ON ses.class_id = c.id
GROUP BY c.id;

-- View: Sessions with statistics
CREATE VIEW sessions_with_stats AS
SELECT 
  s.*,
  COUNT(DISTINCT sa.student_id) FILTER (WHERE sa.is_present = true) as present_count,
  COUNT(DISTINCT sa.student_id) FILTER (WHERE sa.is_present = false) as absent_count,
  COUNT(DISTINCT o.id) as observation_count,
  COUNT(DISTINCT o.id) FILTER (WHERE o.sentiment = 'positive') as positive_count,
  COUNT(DISTINCT o.id) FILTER (WHERE o.sentiment = 'negative') as negative_count
FROM sessions s
LEFT JOIN session_attendance sa ON sa.session_id = s.id
LEFT JOIN observations o ON o.session_id = s.id
GROUP BY s.id;

-- View: Student progress summary
CREATE VIEW student_progress AS
SELECT 
  st.id as student_id,
  st.first_name,
  st.last_name,
  st.class_id,
  COUNT(DISTINCT sa.session_id) as sessions_attended,
  COUNT(DISTINCT o.id) as total_observations,
  COUNT(DISTINCT o.id) FILTER (WHERE o.sentiment = 'positive') as positive_observations,
  COUNT(DISTINCT o.id) FILTER (WHERE o.sentiment = 'negative') as negative_observations,
  COUNT(DISTINCT o.id) FILTER (WHERE o.category = 'progress') as progress_observations
FROM students st
LEFT JOIN session_attendance sa ON sa.student_id = st.id AND sa.is_present = true
LEFT JOIN observations o ON o.student_id = st.id
GROUP BY st.id;

-- ============================================
-- STORAGE BUCKETS (to be created in Supabase Dashboard)
-- ============================================

-- Bucket: audio-recordings
-- - For storing audio files from voice recognition
-- - Private access
-- - Max file size: 10MB

-- Bucket: reports
-- - For storing generated PDF reports
-- - Private access
-- - Max file size: 5MB

-- Bucket: exports
-- - For storing Excel exports
-- - Private access
-- - Max file size: 10MB

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for observations (for live updates during sessions)
ALTER PUBLICATION supabase_realtime ADD TABLE observations;
ALTER PUBLICATION supabase_realtime ADD TABLE session_attendance;

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Note: This should only be run in development environment
-- Comment out for production

/*
-- Sample profile (will be created via auth.users)
INSERT INTO profiles (id, email, full_name, school_name)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'prof.dupont@example.com', 'Marie Dupont', 'Collège Victor Hugo');

-- Sample class
INSERT INTO classes (id, teacher_id, name, level, school_year)
VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '3ème B', '3ème', '2024-2025');

-- Sample students
INSERT INTO students (class_id, first_name, last_name, date_of_birth)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Léa', 'Martin', '2010-05-15'),
  ('10000000-0000-0000-0000-000000000001', 'Thomas', 'Bernard', '2010-08-22'),
  ('10000000-0000-0000-0000-000000000001', 'Sophie', 'Dubois', '2010-03-10'),
  ('10000000-0000-0000-0000-000000000001', 'Lucas', 'Petit', '2010-11-30');
*/

-- ============================================
-- NOTES
-- ============================================

-- 1. After running this schema, create the storage buckets in Supabase Dashboard
-- 2. Configure storage policies for private access
-- 3. Set up Supabase Auth email templates
-- 4. Configure environment variables in your application
-- 5. Test RLS policies thoroughly before production

-- ============================================
-- END OF SCHEMA
-- ============================================
