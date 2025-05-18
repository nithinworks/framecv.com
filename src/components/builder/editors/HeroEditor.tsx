
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HeroEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;

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
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        hero: {
          ...sections.hero,
          ctaButtons: [
            ...sections.hero.ctaButtons,
            { text: "New Button", url: "#", isPrimary: false }
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
        <Label htmlFor="hero-enabled">Enable Hero Section</Label>
        <Switch 
          id="hero-enabled" 
          checked={sections.hero.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {sections.hero.enabled && (
        <>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Call to Action Buttons</h3>
            
            {sections.hero.ctaButtons.map((button, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md">
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
                  <div>
                    <Label htmlFor={`button-text-${index}`}>Text</Label>
                    <Input 
                      id={`button-text-${index}`} 
                      value={button.text} 
                      onChange={(e) => handleButtonChange(index, "text", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`button-url-${index}`}>URL</Label>
                    <Input 
                      id={`button-url-${index}`} 
                      value={button.url} 
                      onChange={(e) => handleButtonChange(index, "url", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`button-icon-${index}`}>Icon</Label>
                    <Select
                      value={button.icon || ""}
                      onValueChange={(value) => handleButtonChange(index, "icon", value)}
                    >
                      <SelectTrigger id={`button-icon-${index}`}>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="mail">Email</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="globe">Globe</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center">
                    <Label htmlFor={`button-primary-${index}`} className="flex-grow">
                      Primary Button
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
            
            <Button 
              variant="outline" 
              type="button" 
              onClick={addButton} 
              className="w-full mt-2"
            >
              Add Button
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroEditor;
