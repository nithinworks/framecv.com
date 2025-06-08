
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { samplePortfolioData } from "@/data/samplePortfolio";

interface ResumeProcessorProps {
  file: File | null;
  onProcessingChange: (isProcessing: boolean) => void;
}

export const useResumeProcessor = ({ file, onProcessingChange }: ResumeProcessorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsProcessing: setGlobalProcessing } = usePortfolio();

  const processResume = useCallback(async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a resume PDF",
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
      
      if (error || !data?.portfolioData) {
        throw new Error('Processing failed');
      }
      
      toast({
        title: "Resume processed successfully!",
        description: "Your portfolio has been generated.",
      });
      
      navigate("/builder", { 
        state: { portfolioData: data.portfolioData }
      });
      
    } catch (error: any) {
      toast({
        title: "AI Processing Failed",
        description: "🤖 Our AI partner is overcooked right now! Please try creating your portfolio manually.",
        variant: "destructive",
        action: (
          <button
            onClick={() => {
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
  }, [file, navigate, setGlobalProcessing, toast, onProcessingChange]);

  return { processResume };
};
