
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
    console.log('=== RESUME SUBMISSION STARTED ===');
    console.log('File selected:', file?.name, 'Size:', file?.size, 'Type:', file?.type);
    
    if (!file) {
      console.log('ERROR: No file selected');
      toast({
        title: "No file selected",
        description: "Please upload a resume PDF",
        variant: "destructive",
      });
      return;
    }
    
    onProcessingChange(true);
    setGlobalProcessing(true);
    
    console.log('Setting processing state to true');
    
    toast({
      title: "Processing your resume",
      description: "AI is analyzing your PDF...",
    });
    
    try {
      console.log('Creating FormData...');
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('FormData created, calling process-resume function...');
      
      const { data, error } = await supabase.functions.invoke('process-resume', {
        body: formData,
      });
      
      console.log('=== SUPABASE FUNCTION RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);
      
      // Handle FunctionsHttpError specifically - it means we got a 400/500 response
      if (error && error.name === 'FunctionsHttpError') {
        console.log('FunctionsHttpError detected - checking response details');
        
        // For validation errors (400 status), the error details should be in the data
        // Let's check if we have data with error information
        if (data && data.error) {
          console.log('Error details found in data:', data);
          
          if (data.error === 'Invalid document type' || data.type === 'NOT_RESUME') {
            console.log('NOT_RESUME error detected');
            toast({
              title: "Invalid Document Type",
              description: data.details || "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
              variant: "destructive",
            });
            return;
          }
          
          if (data.type === 'VALIDATION_ERROR') {
            console.log('VALIDATION_ERROR detected');
            toast({
              title: "Validation Error",
              description: data.details || "Please check your file and try again.",
              variant: "destructive",
            });
            return;
          }
        }
        
        // If no specific error type found, show generic AI error
        console.log('No specific error type found, showing generic AI error');
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
        return;
      }
      
      // Success case
      if (data?.portfolioData) {
        console.log('SUCCESS: Portfolio data received');
        console.log('Portfolio data keys:', Object.keys(data.portfolioData));
        
        toast({
          title: "Resume processed successfully!",
          description: "Your portfolio has been generated.",
        });
        
        navigate("/builder", { 
          state: { portfolioData: data.portfolioData }
        });
        return;
      }
      
      // No data received
      console.log('No portfolio data received');
      throw new Error('No portfolio data received');
      
    } catch (error: any) {
      console.log('=== CATCH BLOCK TRIGGERED ===');
      console.log('Caught error:', error);
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      
      // This catch block should only handle network errors and other unexpected issues
      console.log('Showing default AI overcooked message');
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
      console.log('=== CLEANING UP ===');
      onProcessingChange(false);
      setGlobalProcessing(false);
      console.log('Processing state reset to false');
    }
  }, [file, navigate, setGlobalProcessing, toast, onProcessingChange]);

  return { processResume };
};
