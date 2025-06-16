
-- Create a dedicated waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add validation trigger for waitlist
CREATE OR REPLACE FUNCTION public.validate_waitlist_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format.';
  END IF;
  
  -- Validate name (non-empty, max 100 chars)
  IF LENGTH(TRIM(NEW.name)) = 0 OR LENGTH(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 1 and 100 characters.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for waitlist validation
CREATE TRIGGER validate_waitlist_submission_trigger
  BEFORE INSERT OR UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_waitlist_submission();

-- Enable RLS on waitlist table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist table
-- Allow anyone to insert (join waitlist)
CREATE POLICY "Anyone can join waitlist" 
  ON public.waitlist 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Allow anyone to view waitlist count (but not individual emails for privacy)
CREATE POLICY "Public can view waitlist stats" 
  ON public.waitlist 
  FOR SELECT 
  TO public
  USING (false); -- This will block direct access to individual records

-- Only service role can view all waitlist data (for admin purposes)
CREATE POLICY "Service role can manage waitlist" 
  ON public.waitlist 
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on portfolio_stats table
ALTER TABLE public.portfolio_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_stats table
-- Allow anyone to read stats (public data)
CREATE POLICY "Anyone can view portfolio stats" 
  ON public.portfolio_stats 
  FOR SELECT 
  TO public
  USING (true);

-- Only service role can modify stats (via functions)
CREATE POLICY "Only service role can modify stats" 
  ON public.portfolio_stats 
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to get waitlist count (public safe way to check waitlist size)
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM public.waitlist;
$$;

-- Create function to add to waitlist
CREATE OR REPLACE FUNCTION public.add_to_waitlist(
  user_name TEXT,
  user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.waitlist (name, email)
  VALUES (TRIM(user_name), LOWER(TRIM(user_email)));
  
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'This email is already on the waitlist.';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to join waitlist: %', SQLERRM;
END;
$$;
