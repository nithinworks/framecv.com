
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface PublishInstructionsStepProps {
  onAgree: () => void;
  onClose: () => void;
}

const PublishInstructionsStep: React.FC<PublishInstructionsStepProps> = ({
  onAgree,
  onClose,
}) => {
  return (
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onAgree}>
          I Agree, Continue
        </Button>
      </div>
    </div>
  );
};

export default PublishInstructionsStep;
