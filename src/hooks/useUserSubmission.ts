
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseUserSubmissionProps {
  actionType: "download" | "deploy";
  portfolioName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const useUserSubmission = ({ actionType, portfolioName, onSuccess, onClose }: UseUserSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitUserDetails = async (name: string, email: string, isAutoSubmit: boolean = false) => {
    setIsLoading(true);

    try {
      // Enhanced input validation and sanitization
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      // Validate name length and content
      if (trimmedName.length === 0 || trimmedName.length > 100) {
        if (!isAutoSubmit) {
          toast.error("Name must be between 1 and 100 characters");
        }
        setIsLoading(false);
        return false;
      }

      // Check for potentially malicious content in name
      const namePattern = /^[a-zA-Z\s\-\.\']+$/;
      if (!namePattern.test(trimmedName)) {
        if (!isAutoSubmit) {
          toast.error("Name contains invalid characters");
        }
        setIsLoading(false);
        return false;
      }

      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        if (!isAutoSubmit) {
          toast.error("Please enter a valid email address");
        }
        setIsLoading(false);
        return false;
      }

      // Additional email security checks
      if (trimmedEmail.length > 254) { // RFC 5321 limit
        if (!isAutoSubmit) {
          toast.error("Email address is too long");
        }
        setIsLoading(false);
        return false;
      }

      // Validate portfolio name if provided
      const sanitizedPortfolioName = portfolioName?.trim().substring(0, 100) || null;

      // Submit using upsert with enhanced error handling
      const { error } = await supabase
        .from('user_submissions')
        .upsert({
          name: trimmedName,
          email: trimmedEmail,
          action_type: actionType,
          portfolio_name: sanitizedPortfolioName
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error saving user details:', error);
        
        // Enhanced error handling with specific messages
        if (error.message.includes('Rate limit exceeded') || 
            error.message.includes('submissions per email per hour') ||
            error.message.includes('Daily rate limit exceeded')) {
          const errorMsg = error.message.includes('Daily') 
            ? "You've reached the daily limit of 50 submissions. Please try again tomorrow."
            : "You've reached the hourly limit of 10 submissions. Please try again later.";
          if (!isAutoSubmit) {
            toast.error(errorMsg);
          }
        } else if (error.message.includes('Invalid email format')) {
          if (!isAutoSubmit) {
            toast.error("Please enter a valid email address");
          }
        } else if (error.message.includes('Name must be') || 
                   error.message.includes('invalid characters')) {
          if (!isAutoSubmit) {
            toast.error("Name must be between 1 and 100 characters and contain only letters, spaces, hyphens, periods, and apostrophes");
          }
        } else if (error.message.includes('Invalid action type')) {
          if (!isAutoSubmit) {
            toast.error("Invalid request type. Please try again.");
          }
        } else {
          if (!isAutoSubmit) {
            toast.error("Failed to save details. Please try again.");
          }
        }
        
        setIsLoading(false);
        return false;
      }

      const successMessage = isAutoSubmit 
        ? "Welcome back! Using your saved details." 
        : "Details saved successfully!";
      
      toast.success(successMessage);
      onClose();
      onSuccess();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      if (!isAutoSubmit) {
        toast.error("An error occurred. Please try again.");
      }
      setIsLoading(false);
      return false;
    }
  };

  return {
    isLoading,
    submitUserDetails
  };
};
