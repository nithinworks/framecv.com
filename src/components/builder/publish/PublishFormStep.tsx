
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioData } from "@/types/portfolio";

interface PublishFormStepProps {
  portfolioData: PortfolioData;
  onSuccess: (url: string) => void;
  onBack: () => void;
}

const PublishFormStep: React.FC<PublishFormStepProps> = ({
  portfolioData,
  onSuccess,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    slugName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.slugName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Enhanced slug validation to match server-side rules
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    if (!slugRegex.test(formData.slugName)) {
      toast.error("Slug name must be 3-50 characters, lowercase letters, numbers, and dashes only");
      return;
    }

    // Full name length validation
    if (formData.fullName.trim().length > 100) {
      toast.error("Full name must be 100 characters or less");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('published_portfolios')
        .insert({
          slug_name: formData.slugName,
          full_name: formData.fullName,
          email: formData.email,
          portfolio_data: portfolioData as any
        });

      if (error) {
        console.error('Error publishing portfolio:', error);
        
        // Handle specific error types
        if (error.code === '23505') {
          toast.error("This slug name is already taken. Please choose a different one.");
        } else if (error.message.includes('Rate limit exceeded')) {
          toast.error("You've reached the daily limit of 5 portfolio publications. Please try again tomorrow.");
        } else if (error.message.includes('Invalid slug name format')) {
          toast.error("Invalid slug name format. Use only lowercase letters, numbers, and dashes (3-50 characters).");
        } else if (error.message.includes('Invalid email format')) {
          toast.error("Please enter a valid email address.");
        } else if (error.message.includes('Full name must be')) {
          toast.error("Full name must be between 1 and 100 characters.");
        } else {
          toast.error("Failed to publish portfolio. Please try again.");
        }
        
        setIsLoading(false);
        return;
      }

      const url = `https://knowabout.io/${formData.slugName}`;
      toast.success("Portfolio published successfully!");
      onSuccess(url);
    } catch (error) {
      console.error('Publishing error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          maxLength={100}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Maximum 100 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slugName">Slug Name</Label>
        <Input
          id="slugName"
          type="text"
          placeholder="your-portfolio-name"
          value={formData.slugName}
          onChange={(e) => setFormData(prev => ({ ...prev, slugName: e.target.value.toLowerCase() }))}
          minLength={3}
          maxLength={50}
          pattern="[a-z0-9-]+"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          3-50 characters, lowercase letters, numbers, and dashes only. Your portfolio will be available at: knowabout.io/{formData.slugName || "your-portfolio-name"}
        </p>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Portfolio"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PublishFormStep;
