
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

const ExperienceEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { experience } = sections;

  // Toggle section enabled
  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        experience: {
          ...experience,
          enabled
        }
      }
    });
  };

  // Update section title
  const handleTitleChange = (title: string) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        experience: {
          ...experience,
          title
        }
      }
    });
  };

  // Add new experience item
  const addExperienceItem = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        experience: {
          ...experience,
          items: [
            ...experience.items,
            {
              company: "New Company",
              position: "Position Title",
              period: "MM/YYYY - Present",
              description: "Description of your role and responsibilities."
            }
          ]
        }
      }
    });
  };

  // Update experience item field
  const updateExperienceItem = (index: number, field: string, value: string) => {
    const updatedItems = [...experience.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        experience: {
          ...experience,
          items: updatedItems
        }
      }
    });
  };

  // Remove experience item
  const removeExperienceItem = (index: number) => {
    const updatedItems = [...experience.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        experience: {
          ...experience,
          items: updatedItems
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="experience-enabled">Enable Experience Section</Label>
        <Switch 
          id="experience-enabled" 
          checked={experience.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {experience.enabled && (
        <>
          <div>
            <Label htmlFor="experience-title">Section Title</Label>
            <Input 
              id="experience-title" 
              value={experience.title} 
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Experience Items</h3>
            
            {experience.items.map((item, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">{item.company || `Experience ${index + 1}`}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeExperienceItem(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`company-${index}`}>Company</Label>
                    <Input 
                      id={`company-${index}`} 
                      value={item.company} 
                      onChange={(e) => updateExperienceItem(index, "company", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`position-${index}`}>Position</Label>
                    <Input 
                      id={`position-${index}`} 
                      value={item.position} 
                      onChange={(e) => updateExperienceItem(index, "position", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`period-${index}`}>Period</Label>
                    <Input 
                      id={`period-${index}`} 
                      value={item.period} 
                      onChange={(e) => updateExperienceItem(index, "period", e.target.value)}
                      placeholder="e.g. 01/2020 - Present"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea 
                      id={`description-${index}`} 
                      value={item.description} 
                      onChange={(e) => updateExperienceItem(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              type="button" 
              onClick={addExperienceItem} 
              className="w-full mt-2"
            >
              Add Experience
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExperienceEditor;
