
-- Create a simple table to store extracted portfolio data
CREATE TABLE public.resume_extractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_data JSONB NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'processing' CHECK (processing_status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_resume_extractions_status ON public.resume_extractions(processing_status);
CREATE INDEX idx_resume_extractions_created_at ON public.resume_extractions(created_at);

-- Enable Row Level Security (RLS) - make it public for now since no user auth is involved
ALTER TABLE public.resume_extractions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (since this is system-generated data)
CREATE POLICY "Allow public access to resume extractions" 
  ON public.resume_extractions 
  FOR ALL 
  USING (true);
