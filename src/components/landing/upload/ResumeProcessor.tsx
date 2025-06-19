
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { samplePortfolioData } from "@/data/samplePortfolio";
import { useOptimizedFeatureFlags } from "@/hooks/useOptimizedFeatureFlags";

interface ResumeProcessorProps {
  file: File | null;
  onProcessingChange: (isProcessing: boolean) => void;
}

export const useResumeProcessor = ({ file, onProcessingChange }: ResumeProcessorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsProcessing: setGlobalProcessing } = usePortfolio();
  const { featureFlags } = useOptimizedFeatureFlags();

  const trackManualCreation = async () => {
    try {
      await supabase.rpc('increment_portfolio_stat', { stat_type: 'manual' });
    } catch (error) {
      console.error('Failed to track portfolio stat:', error);
    }
  };

  const processResume = useCallback(async () => {
    // Check if resume processing is enabled
    if (!featureFlags.process_resume_status) {
      toast({
        title: "Feature temporarily unavailable",
        description: "Resume processing is currently disabled. Please try again later or create your portfolio manually.",
        variant: "destructive",
        action: (
          <button
            onClick={async () => {
              await trackManualCreation();
              navigate("/builder", { 
                state: { portfolioData: samplePortfolioData }
              });
            }}
            className="ml-2 bg-white text-black border border-gray-600 hover:bg-gray-100 px-3 py-1 rounded text-sm"
          >
            Create Manually
          </button>
        ),
      });
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a single-page PDF resume",
        variant: "destructive",
      });
      return;
    }
    
    onProcessingChange(true);
    setGlobalProcessing(true);
    
    toast({
      title: "Processing your resume",
      description: "AI is analyzing your PDF...",
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data, error } = await supabase.functions.invoke('process-resume', {
        body: formData,
      });
      
      if (error) {
        console.error('Processing error:', error);
        
        // Handle specific error types
        if (error.message?.includes('Rate limit exceeded')) {
          toast({
            title: "Daily limit reached",
            description: "You've reached the 5 uploads per day limit. Please try again tomorrow.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('single-page') || error.message?.includes('1 page')) {
          toast({
            title: "Multi-page PDF detected",
            description: "Please upload a single-page resume only. Consider condensing your resume to one page.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('not a valid resume')) {
          toast({
            title: "Document not recognized",
            description: "The uploaded file doesn't appear to be a resume. Please upload a proper CV/resume document.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(error.message || 'Processing failed');
      }
      
      if (!data?.portfolioData) {
        throw new Error('No portfolio data received');
      }
      
      toast({
        title: "Resume processed successfully!",
        description: "Your portfolio has been generated.",
      });
      
      navigate("/builder", { 
        state: { portfolioData: data.portfolioData }
      });
      
    } catch (error: any) {
      console.error('Resume processing error:', error);
      
      toast({
        title: "AI Processing Failed",
        description: "🤖 Our AI partner is temporarily unavailable. Please try creating your portfolio manually.",
        variant: "destructive",
        action: (
          <button
            onClick={async () => {
              await trackManualCreation();
              navigate("/builder", { 
                state: { portfolioData: samplePortfolioData }
              });
            }}
            className="ml-2 bg-white text-black border border-gray-600 hover:bg-gray-100 px-3 py-1 rounded text-sm"
          >
            Create Manually
          </button>
        ),
      });
    } finally {
      onProcessingChange(false);
      setGlobalProcessing(false);
    }
  }, [file, navigate, setGlobalProcessing, toast, onProcessingChange, featureFlags.process_resume_status]);

  return { processResume };
};
