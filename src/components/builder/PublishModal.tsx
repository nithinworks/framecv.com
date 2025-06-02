
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ExternalLink, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioData } from "@/types/portfolio";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioData: PortfolioData;
}

const PublishModal: React.FC<PublishModalProps> = ({
  open,
  onOpenChange,
  portfolioData,
}) => {
  const [step, setStep] = useState<"instructions" | "form" | "success">("instructions");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    slugName: "",
  });
  const [publishedUrl, setPublishedUrl] = useState("");

  const handleAgree = () => {
    setStep("form");
  };

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
      setPublishedUrl(url);
      setStep("success");
      toast.success("Portfolio published successfully!");
    } catch (error) {
      console.error('Publishing error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
    toast.success("URL copied to clipboard!");
  };

  const handleClose = () => {
    setStep("instructions");
    setFormData({ fullName: "", email: "", slugName: "" });
    setPublishedUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "instructions" && "Publish Portfolio"}
            {step === "form" && "Portfolio Details"}
            {step === "success" && "Published Successfully!"}
          </DialogTitle>
        </DialogHeader>

        {step === "instructions" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-sm space-y-3">
                  <p className="font-medium">Before you publish:</p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Your portfolio will be publicly accessible</li>
                    <li>• Published portfolios automatically expire after 30 days</li>
                    <li>• The slug name cannot be changed once published</li>
                    <li>• Maximum 5 portfolios per email per day</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleAgree}>
                I Agree, Continue
              </Button>
            </div>
          </div>
        )}

        {step === "form" && (
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
              <Button type="button" variant="outline" onClick={() => setStep("instructions")} disabled={isLoading}>
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
        )}

        {step === "success" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Portfolio is Live!</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your portfolio is now accessible to everyone at the URL below.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Input
                  value={publishedUrl}
                  readOnly
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(publishedUrl, '_blank')}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-medium">Expires:</span> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                <p><span className="font-medium">Slug:</span> {formData.slugName}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
