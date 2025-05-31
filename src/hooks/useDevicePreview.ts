
import { useState } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DevicePreview {
  type: DeviceType;
  label: string;
  icon: string;
  width: string;
  height: string;
  maxWidth?: string;
}

export const DEVICE_PREVIEWS: DevicePreview[] = [
  {
    type: "mobile",
    label: "iPhone",
    icon: "smartphone",
    width: "375px",
    height: "667px",
    maxWidth: "375px"
  },
  {
    type: "tablet", 
    label: "iPad",
    icon: "tablet",
    width: "768px",
    height: "1024px",
    maxWidth: "768px"
  },
  {
    type: "desktop",
    label: "Desktop",
    icon: "laptop",
    width: "100%",
    height: "100%"
  }
];

export const useDevicePreview = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>("desktop");

  const getCurrentDevice = () => {
    return DEVICE_PREVIEWS.find(device => device.type === currentDevice) || DEVICE_PREVIEWS[2];
  };

  return {
    currentDevice,
    setCurrentDevice,
    getCurrentDevice,
    devices: DEVICE_PREVIEWS
  };
};
