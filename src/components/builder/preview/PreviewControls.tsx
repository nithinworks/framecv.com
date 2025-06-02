
import React from "react";
import DeviceToggle from "@/components/builder/DeviceToggle";

const PreviewControls: React.FC = () => {
  return (
    <div className="flex justify-center mb-4 animate-fade-in">
      <DeviceToggle />
    </div>
  );
};

export default PreviewControls;
