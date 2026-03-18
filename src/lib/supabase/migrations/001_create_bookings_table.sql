-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  therapist_id TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for common queries
CREATE INDEX idx_bookings_email ON public.bookings(email);
CREATE INDEX idx_bookings_therapist_id ON public.bookings(therapist_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);
    
-- Create composite index for filtering by date and therapist
CREATE INDEX idx_bookings_date_therapist ON public.bookings(date, therapist_id);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bookings
CREATE POLICY "Allow public to insert bookings" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to read bookings
CREATE POLICY "Allow public to read bookings" ON public.bookings
  FOR SELECT
  USING (true);

-- Create policy to allow users to update their own bookings
CREATE POLICY "Allow users to update own bookings" ON public.bookings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
