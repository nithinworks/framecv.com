
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const HeroEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { settings, sections } = portfolioData;

  const handleSettingsChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      settings: {
        ...settings,
        [field]: value
      }
    });
  };

  const handleCtaChange = (index: number, field: string, value: string) => {
    const updatedCtas = [...(sections.hero.ctaButtons || [])];
    updatedCtas[index] = { ...updatedCtas[index], [field]: value };
    
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: updatedCtas
        }
      }
    });
  };

  const addCtaButton = () => {
    if ((sections.hero.ctaButtons || []).length >= 2) return;
    
    const newCta = {
      text: "Contact Me",
      url: "#contact",
      isPrimary: (sections.hero.ctaButtons || []).length === 0,
      icon: "mail"
    };
    
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: [...(sections.hero.ctaButtons || []), newCta]
        }
      }
    });
  };

  const removeCtaButton = (index: number) => {
    const updatedCtas = (sections.hero.ctaButtons || []).filter((_, i) => i !== index);
    
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: updatedCtas
        }
      }
    });
  };

  const iconOptions = [
    { value: "none", label: "None" },
    { value: "mail", label: "Email" },
    { value: "download", label: "Download" },
    { value: "phone", label: "Phone" },
    { value: "globe", label: "Website" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "github", label: "GitHub" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "document", label: "Document" }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
          <Input 
            id="name"
            value={settings.name} 
            onChange={(e) => handleSettingsChange("name", e.target.value)}
            placeholder="John Doe"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="title" className="text-sm font-medium">Professional Title</Label>
          <Input 
            id="title"
            value={settings.title} 
            onChange={(e) => handleSettingsChange("title", e.target.value)}
            placeholder="Full Stack Developer"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
          <Input 
            id="location"
            value={settings.location} 
            onChange={(e) => handleSettingsChange("location", e.target.value)}
            placeholder="New York, USA"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="summary" className="text-sm font-medium">Short Summary</Label>
          <Textarea 
            id="summary"
            value={settings.summary} 
            onChange={(e) => handleSettingsChange("summary", e.target.value)}
            placeholder="Passionate developer with expertise in modern web technologies..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="profileImage" className="text-sm font-medium">Profile Image URL</Label>
          <Input 
            id="profileImage"
            value={settings.profileImage} 
            onChange={(e) => handleSettingsChange("profileImage", e.target.value)}
            placeholder="https://example.com/profile.jpg"
            className="mt-1"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Call to Action Buttons</h3>
          <Button 
            onClick={addCtaButton} 
            size="sm" 
            variant="outline"
            disabled={(sections.hero.ctaButtons || []).length >= 2}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Button
          </Button>
        </div>

        <div className="space-y-4">
          {(sections.hero.ctaButtons || []).map((cta, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Button {index + 1}</span>
                <Button 
                  onClick={() => removeCtaButton(index)} 
                  size="sm" 
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Button Text</Label>
                  <Input 
                    value={cta.text} 
                    onChange={(e) => handleCtaChange(index, "text", e.target.value)}
                    placeholder="Contact Me"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input 
                    value={cta.url} 
                    onChange={(e) => handleCtaChange(index, "url", e.target.value)}
                    placeholder="#contact"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Icon</Label>
                  <Select value={cta.icon || "none"} onValueChange={(value) => handleCtaChange(index, "icon", value === "none" ? "" : value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Style</Label>
                  <Select value={cta.isPrimary ? "primary" : "secondary"} onValueChange={(value) => handleCtaChange(index, "isPrimary", value === "primary")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {(sections.hero.ctaButtons || []).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No call-to-action buttons added yet.</p>
        )}
      </div>
    </div>
  );
};

export default HeroEditor;
