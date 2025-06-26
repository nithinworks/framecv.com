
-- Add portfolio_link column to user_submissions table
ALTER TABLE public.user_submissions 
ADD COLUMN portfolio_link text;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.user_submissions.portfolio_link IS 'Stores the live deployed URL for GitHub deployments, null for downloads';
