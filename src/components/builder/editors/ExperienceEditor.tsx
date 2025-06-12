
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

const ExperienceEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { experience } = sections;

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
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="experience-title" className="text-xs">Section Title</Label>
        <Input 
          id="experience-title" 
          value={experience.title} 
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-3 text-xs">Experience Items</h3>
        
        {experience.items.map((item, index) => (
          <div key={index} className="mb-4 p-3 border rounded-md space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold">{item.company || `Experience ${index + 1}`}</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeExperienceItem(index)}
                className="h-6 w-6 p-0"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor={`company-${index}`} className="text-xs">Company</Label>
                <Input 
                  id={`company-${index}`} 
                  value={item.company} 
                  onChange={(e) => updateExperienceItem(index, "company", e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`position-${index}`} className="text-xs">Position</Label>
                <Input 
                  id={`position-${index}`} 
                  value={item.position} 
                  onChange={(e) => updateExperienceItem(index, "position", e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`period-${index}`} className="text-xs">Period</Label>
                <Input 
                  id={`period-${index}`} 
                  value={item.period} 
                  onChange={(e) => updateExperienceItem(index, "period", e.target.value)}
                  placeholder="e.g. 01/2020 - Present"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
                <Textarea 
                  id={`description-${index}`} 
                  value={item.description} 
                  onChange={(e) => updateExperienceItem(index, "description", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          type="button" 
          onClick={addExperienceItem} 
          className="w-full mt-2 h-7 text-xs"
        >
          Add Experience
        </Button>
      </div>
    </div>
  );
};

export default ExperienceEditor;
