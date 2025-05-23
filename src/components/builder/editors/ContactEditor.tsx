
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

const ContactEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;

  const handleContactChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        contact: {
          ...sections.contact,
          [field]: value
        }
      }
    });
  };

  const handleSocialChange = (field: string, value: any) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...sections.social,
          [field]: value
        }
      }
    });
  };

  const addSocialLink = () => {
    const currentItems = sections.social?.items || [];
    const newItem = {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/johndoe",
      icon: "linkedin"
    };
    
    handleSocialChange("items", [...currentItems, newItem]);
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const currentItems = sections.social?.items || [];
    const updatedItems = currentItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    handleSocialChange("items", updatedItems);
  };

  const removeSocialLink = (index: number) => {
    const currentItems = sections.social?.items || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    handleSocialChange("items", updatedItems);
  };

  const socialPlatforms = [
    { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
    { value: "github", label: "GitHub", icon: "github" },
    { value: "twitter", label: "Twitter", icon: "twitter" },
    { value: "instagram", label: "Instagram", icon: "instagram" },
    { value: "facebook", label: "Facebook", icon: "facebook" },
    { value: "youtube", label: "YouTube", icon: "youtube" },
    { value: "website", label: "Website", icon: "globe" }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="contactTitle" className="text-sm font-medium">Section Title</Label>
          <Input 
            id="contactTitle"
            value={sections.contact.title} 
            onChange={(e) => handleContactChange("title", e.target.value)}
            placeholder="Get in Touch"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input 
            id="email"
            value={sections.contact.email} 
            onChange={(e) => handleContactChange("email", e.target.value)}
            placeholder="john.doe@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
          <Input 
            id="phone"
            value={sections.contact.phone} 
            onChange={(e) => handleContactChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="contactLocation" className="text-sm font-medium">Location</Label>
          <Input 
            id="contactLocation"
            value={sections.contact.location} 
            onChange={(e) => handleContactChange("location", e.target.value)}
            placeholder="New York, USA"
            className="mt-1"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Social Links</h3>
          <Button onClick={addSocialLink} size="sm" variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>

        <div className="space-y-4">
          {(sections.social?.items || []).map((social, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Social Link {index + 1}</span>
                <Button 
                  onClick={() => removeSocialLink(index)} 
                  size="sm" 
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-xs">Platform</Label>
                  <Select 
                    value={social.platform.toLowerCase()} 
                    onValueChange={(value) => {
                      const platform = socialPlatforms.find(p => p.value === value);
                      if (platform) {
                        updateSocialLink(index, "platform", platform.label);
                        updateSocialLink(index, "icon", platform.icon);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input 
                    value={social.url} 
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {(!sections.social?.items || sections.social.items.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">No social links added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ContactEditor;
