import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
interface PublishSuccessStepProps {
  publishedUrl: string;
  onClose: () => void;
}
const PublishSuccessStep: React.FC<PublishSuccessStepProps> = ({
  publishedUrl,
  onClose
}) => {
  useEffect(() => {
    // Trigger confetti animation when component mounts
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6
      }
    });
  }, []);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
    toast.success("URL copied to clipboard!");
  };
  return <div className="space-y-6">
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
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e2d2d]/50">
          <Input value={publishedUrl} readOnly className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm" />
          <Button size="sm" variant="outline" onClick={copyToClipboard} className="flex-shrink-0">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open(publishedUrl, '_blank')} className="flex-shrink-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>
          Done
        </Button>
      </div>
    </div>;
};
export default PublishSuccessStep;