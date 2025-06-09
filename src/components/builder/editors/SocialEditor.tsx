
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";

const SocialEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { social } = sections;

  const platformOptions = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "github", label: "GitHub" },
    { value: "twitter", label: "Twitter" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "dribbble", label: "Dribbble" },
    { value: "behance", label: "Behance" },
    { value: "website", label: "Website" },
    { value: "portfolio", label: "Portfolio" }
  ];

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          enabled
        }
      }
    });
  };

  const addSocialItem = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          items: [
            ...social.items,
            {
              platform: "linkedin",
              name: "LinkedIn",
              url: "https://",
              icon: "globe"
            }
          ]
        }
      }
    });
  };

  const updateSocialItem = (index: number, field: string, value: string) => {
    const updatedItems = [...social.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // If platform is being updated, also update the name
    if (field === "platform") {
      const platform = platformOptions.find(p => p.value === value);
      if (platform) {
        updatedItems[index].name = platform.label;
      }
    }

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          items: updatedItems
        }
      }
    });
  };

  const removeSocialItem = (index: number) => {
    const updatedItems = [...social.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          items: updatedItems
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="social-enabled">Enable Social Section</Label>
        <Switch 
          id="social-enabled" 
          checked={social.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {social.enabled && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Social Media Links</h3>
          
          {social.items.map((item, index) => (
            <div key={index} className="mb-6 p-4 border rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold">{item.name || platformOptions.find(p => p.value === item.platform)?.label || item.platform}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSocialItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`platform-${index}`}>Platform</Label>
                  <Select 
                    value={item.platform} 
                    onValueChange={(value) => updateSocialItem(index, "platform", value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`url-${index}`}>URL</Label>
                  <Input 
                    id={`url-${index}`} 
                    value={item.url} 
                    onChange={(e) => updateSocialItem(index, "url", e.target.value)}
                    type="url"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            type="button" 
            onClick={addSocialItem} 
            className="w-full mt-2"
          >
            Add Social Link
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialEditor;
