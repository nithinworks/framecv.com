
-- Add daily limit columns to feature_flags table
ALTER TABLE public.feature_flags 
ADD COLUMN daily_limit INTEGER NOT NULL DEFAULT 300,
ADD COLUMN daily_used_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Function to check and increment daily usage
CREATE OR REPLACE FUNCTION public.check_and_increment_daily_usage()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_limit INTEGER;
  current_usage INTEGER;
  last_reset DATE;
  flag_record RECORD;
BEGIN
  -- Get current feature flag record
  SELECT daily_limit, daily_used_count, last_reset_date 
  INTO flag_record
  FROM public.feature_flags 
  LIMIT 1;
  
  -- Check if we need to reset daily count (new day)
  IF flag_record.last_reset_date < CURRENT_DATE THEN
    UPDATE public.feature_flags 
    SET daily_used_count = 0, 
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = (SELECT id FROM public.feature_flags LIMIT 1);
    
    -- Refresh the record after reset
    SELECT daily_limit, daily_used_count 
    INTO flag_record
    FROM public.feature_flags 
    LIMIT 1;
  END IF;
  
  -- Check if daily limit is reached
  IF flag_record.daily_used_count >= flag_record.daily_limit THEN
    RETURN FALSE; -- Limit reached
  END IF;
  
  -- Increment usage count
  UPDATE public.feature_flags 
  SET daily_used_count = daily_used_count + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.feature_flags LIMIT 1);
  
  RETURN TRUE; -- Usage incremented successfully
END;
$$;

-- Function to get current daily usage stats
CREATE OR REPLACE FUNCTION public.get_daily_usage_stats()
RETURNS TABLE(daily_limit INTEGER, daily_used_count INTEGER, remaining_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  flag_record RECORD;
BEGIN
  -- Get current feature flag record
  SELECT f.daily_limit, f.daily_used_count, f.last_reset_date 
  INTO flag_record
  FROM public.feature_flags f
  LIMIT 1;
  
  -- Check if we need to reset daily count (new day)
  IF flag_record.last_reset_date < CURRENT_DATE THEN
    UPDATE public.feature_flags 
    SET daily_used_count = 0, 
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = (SELECT id FROM public.feature_flags LIMIT 1);
    
    -- Return reset values
    RETURN QUERY SELECT flag_record.daily_limit, 0::INTEGER, flag_record.daily_limit;
  ELSE
    -- Return current values
    RETURN QUERY SELECT 
      flag_record.daily_limit, 
      flag_record.daily_used_count, 
      (flag_record.daily_limit - flag_record.daily_used_count)::INTEGER;
  END IF;
END;
$$;
