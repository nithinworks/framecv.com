
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
      
      // Handle the case where we get an error response but it's actually a validation error
      if (error) {
        console.log('Function invocation error detected:', error);
        
        // Check if it's a FunctionsHttpError with status 400 (validation error)
        if (error.name === 'FunctionsHttpError') {
          try {
            // Try to parse the error message for specific error types
            const errorMessage = error.message || '';
            console.log('FunctionsHttpError message:', errorMessage);
            
            // Check if the error contains our specific error response
            if (errorMessage.includes('NOT_RESUME') || errorMessage.includes('Invalid document type')) {
              console.log('NOT_RESUME error detected from FunctionsHttpError');
              toast({
                title: "Invalid Document Type",
                description: "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
                variant: "destructive",
              });
              return;
            }
            
            if (errorMessage.includes('VALIDATION_ERROR')) {
              console.log('VALIDATION_ERROR detected from FunctionsHttpError');
              toast({
                title: "Validation Error",
                description: "Please check your file and try again.",
                variant: "destructive",
              });
              return;
            }
          } catch (parseError) {
            console.log('Failed to parse FunctionsHttpError:', parseError);
          }
        }
        
        // If it's not a specific validation error, throw it to be handled by the main catch
        throw error;
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
      
      // Check for structured error responses in data (fallback)
      if (data?.type === 'NOT_RESUME') {
        console.log('NOT_RESUME response in data');
        toast({
          title: "Invalid Document Type",
          description: data.details || "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
          variant: "destructive",
        });
        return;
      }
      
      if (data?.type === 'VALIDATION_ERROR') {
        console.log('VALIDATION_ERROR response in data');
        toast({
          title: "Validation Error",
          description: data.details || "Please check your file and try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('No portfolio data or error type found, throwing error');
      throw new Error('No portfolio data received');
      
    } catch (error: any) {
      console.log('=== CATCH BLOCK TRIGGERED ===');
      console.log('Caught error:', error);
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      
      // Check error message for specific types
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('not_resume') || 
          errorMessage.includes('not a resume') || 
          errorMessage.includes('invalid document')) {
        console.log('NOT_RESUME error detected in message');
        toast({
          title: "Invalid Document Type",
          description: "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
          variant: "destructive",
        });
        return;
      }
      
      // Default AI processing error
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
