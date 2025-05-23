
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash, User, Briefcase, MapPin, FileText, Image, ExternalLink, Link } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HeroEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections, settings } = portfolioData;

  const handleSettingsChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      settings: {
        ...settings,
        [field]: value
      }
    });
  };

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          enabled
        }
      }
    });
  };

  const handleButtonChange = (index: number, field: string, value: string | boolean) => {
    const updatedButtons = [...sections.hero.ctaButtons];
    updatedButtons[index] = {
      ...updatedButtons[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: updatedButtons
        }
      }
    });
  };

  const addButton = () => {
    if (sections.hero.ctaButtons.length >= 2) {
      return; // Maximum two buttons allowed
    }
    
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: [
            ...sections.hero.ctaButtons,
            { text: "New Button", url: "#", isPrimary: false, icon: "none" }
          ]
        }
      }
    });
  };

  const removeButton = (index: number) => {
    const updatedButtons = [...sections.hero.ctaButtons];
    updatedButtons.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: updatedButtons
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="hero-enabled">Show Personal Information</Label>
        <Switch 
          id="hero-enabled" 
          checked={sections.hero.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {sections.hero.enabled && (
        <>
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe"
                  value={settings.name} 
                  onChange={(e) => handleSettingsChange("name", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="title">Professional Title</Label>
                <Input 
                  id="title" 
                  placeholder="Full Stack Developer"
                  value={settings.title} 
                  onChange={(e) => handleSettingsChange("title", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="San Francisco, CA"
                  value={settings.location} 
                  onChange={(e) => handleSettingsChange("location", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-start space-x-3 pt-1">
              <FileText className="w-4 h-4 text-gray-500 mt-2" />
              <div className="w-full">
                <Label htmlFor="summary">Short Summary</Label>
                <Textarea 
                  id="summary" 
                  placeholder="A brief introduction about yourself and your professional background."
                  value={settings.summary} 
                  onChange={(e) => handleSettingsChange("summary", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Image className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input 
                  id="profileImage" 
                  placeholder="https://example.com/your-image.jpg"
                  value={settings.profileImage} 
                  onChange={(e) => handleSettingsChange("profileImage", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Call to Action Buttons</h3>
              {sections.hero.ctaButtons.length < 2 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addButton}
                >
                  Add Button
                </Button>
              )}
            </div>
            
            {sections.hero.ctaButtons.map((button, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">Button {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeButton(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <div className="w-full">
                      <Label htmlFor={`button-text-${index}`}>Button Text</Label>
                      <Input 
                        id={`button-text-${index}`} 
                        placeholder="Connect with me"
                        value={button.text} 
                        onChange={(e) => handleButtonChange(index, "text", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link className="w-4 h-4 text-gray-500" />
                    <div className="w-full">
                      <Label htmlFor={`button-url-${index}`}>URL</Label>
                      <Input 
                        id={`button-url-${index}`} 
                        placeholder="https://example.com or mailto:email@example.com"
                        value={button.url} 
                        onChange={(e) => handleButtonChange(index, "url", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Image className="w-4 h-4 text-gray-500" />
                    <div className="w-full">
                      <Label htmlFor={`button-icon-${index}`}>Icon</Label>
                      <Select
                        value={button.icon || "none"}
                        onValueChange={(value) => handleButtonChange(index, "icon", value)}
                      >
                        <SelectTrigger id={`button-icon-${index}`}>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="mail">Email</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="globe">Globe</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`button-primary-${index}`} className="flex-grow">
                      Primary Style
                    </Label>
                    <Switch 
                      id={`button-primary-${index}`} 
                      checked={button.isPrimary}
                      onCheckedChange={(value) => handleButtonChange(index, "isPrimary", value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroEditor;
