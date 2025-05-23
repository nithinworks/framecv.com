
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const SettingsEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { settings, sections, navigation, footer } = portfolioData;

  const predefinedColors = [
    "#d65822", "#0067C7", "#7C3AED", "#059669", "#DC2626", 
    "#EA580C", "#9333EA", "#0891B2", "#16A34A", "#DB2777"
  ];

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

  const addNavItem = () => {
    setPortfolioData({
      ...portfolioData,
      navigation: {
        ...navigation,
        items: [
          ...navigation.items,
          { name: "New Link", url: "#" }
        ]
      }
    });
  };

  const updateNavItem = (index: number, field: string, value: string) => {
    const updatedItems = [...navigation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      navigation: {
        ...navigation,
        items: updatedItems
      }
    });
  };

  const removeNavItem = (index: number) => {
    const updatedItems = [...navigation.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      navigation: {
        ...navigation,
        items: updatedItems
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="primaryColor" className="text-sm font-medium mb-3 block">Theme Color</Label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => handleChange("primaryColor", color)}
                className={`w-8 h-8 rounded-md border-2 transition-all ${
                  settings.primaryColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Label htmlFor="customColor" className="text-xs">Custom:</Label>
            <Input 
              id="customColor"
              value={settings.primaryColor} 
              onChange={(e) => handleChange("primaryColor", e.target.value)}
              className="flex-1 text-xs"
              placeholder="#0067C7"
            />
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-4">Sections Visibility</h3>
        
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Navigation Menu</h3>
          <Button 
            onClick={addNavItem} 
            size="sm" 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {navigation.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Input 
                  value={item.name} 
                  onChange={(e) => updateNavItem(index, "name", e.target.value)}
                  placeholder="Link text"
                  className="text-xs"
                />
              </div>
              <div className="flex-1">
                <Input 
                  value={item.url} 
                  onChange={(e) => updateNavItem(index, "url", e.target.value)}
                  placeholder="URL"
                  className="text-xs"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeNavItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {navigation.items.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">No navigation items added yet.</p>
          )}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="footer-enabled" className="text-sm font-medium">Footer</Label>
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
