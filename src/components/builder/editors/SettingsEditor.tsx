
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleLeft, Navigation, Copyright } from "lucide-react";

const SettingsEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { settings, sections, navigation, footer } = portfolioData;

  const handleChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      settings: {
        ...settings,
        [field]: value
      }
    });
  };

  const handleSectionToggle = (section: string, enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        [section]: {
          ...sections[section],
          enabled
        }
      }
    });
  };

  const handleFooterToggle = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      footer: {
        ...footer,
        enabled
      }
    });
  };

  const handleFooterChange = (value: string) => {
    setPortfolioData({
      ...portfolioData,
      footer: {
        ...footer,
        copyright: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="primaryColor" className="text-sm font-medium mb-2 block">Theme Color</Label>
          <div className="flex gap-3 items-center">
            <input 
              type="color"
              id="primaryColor" 
              value={settings.primaryColor} 
              onChange={(e) => handleChange("primaryColor", e.target.value)}
              className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
            />
            <Input 
              value={settings.primaryColor} 
              onChange={(e) => handleChange("primaryColor", e.target.value)}
              className="flex-1"
              placeholder="#0067C7"
            />
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 mb-4">
          <ToggleLeft className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium">Sections Visibility</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-hero" className="text-sm">Personal Information</Label>
            <Switch 
              id="toggle-hero" 
              checked={sections.hero.enabled}
              onCheckedChange={(enabled) => handleSectionToggle("hero", enabled)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-about" className="text-sm">About & Skills</Label>
            <Switch 
              id="toggle-about" 
              checked={sections.about.enabled}
              onCheckedChange={(enabled) => handleSectionToggle("about", enabled)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-experience" className="text-sm">Experience</Label>
            <Switch 
              id="toggle-experience" 
              checked={sections.experience.enabled}
              onCheckedChange={(enabled) => handleSectionToggle("experience", enabled)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-projects" className="text-sm">Projects</Label>
            <Switch 
              id="toggle-projects" 
              checked={sections.projects.enabled}
              onCheckedChange={(enabled) => handleSectionToggle("projects", enabled)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-education" className="text-sm">Education</Label>
            <Switch 
              id="toggle-education" 
              checked={sections.education.enabled}
              onCheckedChange={(enabled) => handleSectionToggle("education", enabled)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="toggle-contact" className="text-sm">Contact</Label>
            <Switch 
              id="toggle-contact" 
              checked={sections.contact.enabled}
              onCheckedChange={(enabled) => handleSectionToggle("contact", enabled)}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center space-x-3 mb-3">
          <Navigation className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium">Navigation Menu</h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Navigation items are automatically generated based on enabled sections.</p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Copyright className="w-4 h-4 text-gray-500" />
            <Label htmlFor="footer-enabled" className="text-sm font-medium">Footer</Label>
          </div>
          <Switch 
            id="footer-enabled" 
            checked={footer.enabled}
            onCheckedChange={handleFooterToggle}
          />
        </div>
        
        {footer.enabled && (
          <div className="mt-3">
            <Label htmlFor="copyright" className="text-sm">Copyright Text</Label>
            <Input 
              id="copyright" 
              value={footer.copyright} 
              onChange={(e) => handleFooterChange(e.target.value)}
              placeholder="© 2024 Your Name. All rights reserved."
              className="mt-1"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsEditor;
