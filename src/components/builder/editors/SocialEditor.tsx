
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash } from "lucide-react";

const SocialEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { social } = sections;

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
              platform: "New Platform",
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
                <h4 className="text-sm font-semibold">{item.platform || `Platform ${index + 1}`}</h4>
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
                  <Label htmlFor={`platform-${index}`}>Platform Name</Label>
                  <Input 
                    id={`platform-${index}`} 
                    value={item.platform} 
                    onChange={(e) => updateSocialItem(index, "platform", e.target.value)}
                  />
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
