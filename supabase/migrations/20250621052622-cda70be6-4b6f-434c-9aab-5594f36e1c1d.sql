
-- Enable RLS on user_submissions table and create comprehensive policies
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert user submissions (for portfolio downloads/deployments)
CREATE POLICY "Anyone can create user submissions" 
  ON public.user_submissions 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Only service role can view user submissions (for admin purposes)
CREATE POLICY "Service role can view all user submissions" 
  ON public.user_submissions 
  FOR SELECT 
  TO service_role
  USING (true);

-- Only service role can update/delete user submissions
CREATE POLICY "Service role can manage user submissions" 
  ON public.user_submissions 
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Tighten feature_flags policies - remove the overly permissive admin policy
DROP POLICY IF EXISTS "Only admins can modify feature flags" ON public.feature_flags;

-- Create more restrictive policy for feature flags modifications
CREATE POLICY "Only service role can modify feature flags" 
  ON public.feature_flags 
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure waitlist and portfolio_stats policies are properly restrictive (they already exist but let's verify)
-- The existing policies are already secure, but let's make sure they're properly configured

-- Add rate limiting policy for user_submissions to prevent abuse
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  submission_count INTEGER;
  ip_submission_count INTEGER;
BEGIN
  -- Check email-based rate limit (10 per hour)
  SELECT COUNT(*) INTO submission_count
  FROM public.user_submissions
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF submission_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 10 submissions per email per hour.';
  END IF;
  
  -- Additional daily limit check (50 per day per email)
  SELECT COUNT(*) INTO submission_count
  FROM public.user_submissions
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF submission_count >= 50 THEN
    RAISE EXCEPTION 'Daily rate limit exceeded. Maximum 50 submissions per email per day.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for enhanced rate limiting
DROP TRIGGER IF EXISTS check_submission_rate_limit_trigger ON public.user_submissions;
CREATE TRIGGER check_submission_rate_limit_trigger_v2
  BEFORE INSERT ON public.user_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_rate_limit_v2();

-- Add indexes for better performance on rate limiting queries
CREATE INDEX IF NOT EXISTS idx_user_submissions_email_created_at 
  ON public.user_submissions (email, created_at);
