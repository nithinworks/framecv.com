
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SettingsEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { settings } = portfolioData;

  const handleChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      settings: {
        ...settings,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          value={settings.name} 
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="title">Professional Title</Label>
        <Input 
          id="title" 
          value={settings.title} 
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          value={settings.location} 
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea 
          id="summary" 
          value={settings.summary} 
          onChange={(e) => handleChange("summary", e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="profileImage">Profile Image URL</Label>
        <Input 
          id="profileImage" 
          value={settings.profileImage} 
          onChange={(e) => handleChange("profileImage", e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Enter a URL to your profile image</p>
      </div>

      <div>
        <Label htmlFor="primaryColor">Primary Color</Label>
        <div className="flex gap-2">
          <div 
            className="w-10 h-10 rounded border"
            style={{ backgroundColor: settings.primaryColor }}
          ></div>
          <Input 
            id="primaryColor" 
            value={settings.primaryColor} 
            onChange={(e) => handleChange("primaryColor", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;
