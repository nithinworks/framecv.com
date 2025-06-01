
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ExternalLink, Copy, CheckCircle } from "lucide-react";
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
  const [step, setStep] = useState<"form" | "instructions" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    slugName: "",
  });
  const [publishedUrl, setPublishedUrl] = useState("");

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

    // Slug validation (alphanumeric and dashes only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slugName)) {
      toast.error("Slug name can only contain lowercase letters, numbers, and dashes");
      return;
    }

    setStep("instructions");
  };

  const handlePublish = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('published_portfolios')
        .insert({
          slug_name: formData.slugName,
          full_name: formData.fullName,
          email: formData.email,
          portfolio_data: portfolioData
        });

      if (error) {
        console.error('Error publishing portfolio:', error);
        if (error.code === '23505') {
          toast.error("This slug name is already taken. Please choose a different one.");
        } else {
          toast.error("Failed to publish portfolio. Please try again.");
        }
        setStep("form");
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
      setStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
    toast.success("URL copied to clipboard!");
  };

  const handleClose = () => {
    setStep("form");
    setFormData({ fullName: "", email: "", slugName: "" });
    setPublishedUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "form" && "Publish Portfolio"}
            {step === "instructions" && "Publishing Terms"}
            {step === "success" && "Portfolio Published!"}
          </DialogTitle>
        </DialogHeader>

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
                required
              />
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
                required
              />
              <p className="text-xs text-gray-500">
                Your portfolio will be available at: knowabout.io/{formData.slugName || "your-portfolio-name"}
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === "instructions" && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Important Information:
                  </p>
                  <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Your portfolio will be publicly accessible at knowabout.io/{formData.slugName}</li>
                    <li>• Once published, the details cannot be edited</li>
                    <li>• Your portfolio will automatically delete after 30 days</li>
                    <li>• The slug name cannot be changed once published</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button onClick={handlePublish} disabled={isLoading}>
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
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Portfolio Published Successfully!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your portfolio is now live and accessible to everyone.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <Label className="text-sm font-medium">Live URL:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={publishedUrl}
                  readOnly
                  className="flex-1"
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
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Published Details:</p>
                <p>Name: {formData.fullName}</p>
                <p>Email: {formData.email}</p>
                <p>Slug: {formData.slugName}</p>
                <p>Expires: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
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
