
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BackNavigationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const BackNavigationModal: React.FC<BackNavigationModalProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] max-w-md mx-auto bg-[#171717] border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-lg">
            Leave Portfolio Builder?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 text-sm">
            Are you sure you want to go back to the homepage? Any unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            No, Stay Here
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            Yes, Go to Homepage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BackNavigationModal;
