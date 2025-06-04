
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ToastTestButton: React.FC = () => {
  const { toast } = useToast();

  const handleTestToast = () => {
    console.log('🧪 Testing toast functionality...');
    
    const result = toast({
      title: "Test Toast",
      description: "If you can see this, the toast system is working perfectly!",
      variant: "default",
    });
    
    console.log('🧪 Toast test result:', result);
  };

  return (
    <div className="mt-8 text-center">
      <Button 
        onClick={handleTestToast}
        variant="outline"
        size="sm"
        className="text-white border-white/20 bg-white/10 hover:bg-white/20"
      >
        Test Toast 🍞
      </Button>
    </div>
  );
};

export default ToastTestButton;
