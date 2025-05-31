
import React from "react";
import { useDevicePreview } from "@/hooks/useDevicePreview";
import { Button } from "@/components/ui/button";
import { Laptop, Smartphone, Tablet } from "lucide-react";

const DevicePreviewControls: React.FC = () => {
  const { currentDevice, setCurrentDevice, devices } = useDevicePreview();

  return (
    <div className="flex justify-center mb-4 gap-2 animate-fade-in">
      {devices.map((device) => {
        const IconComponent = device.icon === "smartphone" ? Smartphone : 
                            device.icon === "tablet" ? Tablet : Laptop;
        
        return (
          <Button
            key={device.type}
            variant={currentDevice === device.type ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentDevice(device.type)}
            className="flex items-center gap-2 h-8 px-3 text-xs"
          >
            <IconComponent className="w-4 h-4" />
            <span className="hidden sm:inline">{device.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default DevicePreviewControls;
