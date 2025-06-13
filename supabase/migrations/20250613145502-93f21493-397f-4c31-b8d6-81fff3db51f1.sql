
-- Create a table for feature flags/gates
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  github_deploy_status BOOLEAN NOT NULL DEFAULT true,
  process_resume_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial record with all features enabled by default
INSERT INTO public.feature_flags (github_deploy_status, process_resume_status)
VALUES (true, true);

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to SELECT (read) feature flags
-- This is public data that controls app behavior
CREATE POLICY "Anyone can view feature flags" 
  ON public.feature_flags 
  FOR SELECT 
  USING (true);

-- Only allow INSERT/UPDATE/DELETE for authenticated users with admin role
-- (You can modify this based on your admin system)
CREATE POLICY "Only admins can modify feature flags" 
  ON public.feature_flags 
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Create function to update feature flags (for admin use)
CREATE OR REPLACE FUNCTION public.update_feature_flag(
  flag_name TEXT,
  flag_value BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called from admin panel or edge function
  -- with proper authentication
  IF flag_name = 'github_deploy_status' THEN
    UPDATE public.feature_flags 
    SET github_deploy_status = flag_value, updated_at = now()
    WHERE id = (SELECT id FROM public.feature_flags LIMIT 1);
    RETURN true;
  ELSIF flag_name = 'process_resume_status' THEN
    UPDATE public.feature_flags 
    SET process_resume_status = flag_value, updated_at = now()
    WHERE id = (SELECT id FROM public.feature_flags LIMIT 1);
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
