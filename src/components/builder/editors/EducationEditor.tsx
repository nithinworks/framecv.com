
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

const EducationEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { education } = sections;

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        education: {
          ...education,
          enabled
        }
      }
    });
  };

  const handleTitleChange = (title: string) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        education: {
          ...education,
          title
        }
      }
    });
  };

  const addEducationItem = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        education: {
          ...education,
          items: [
            ...education.items,
            {
              institution: "New Institution",
              degree: "Degree Title",
              period: "YYYY - YYYY",
              description: ""
            }
          ]
        }
      }
    });
  };

  const updateEducationItem = (index: number, field: string, value: string) => {
    const updatedItems = [...education.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        education: {
          ...education,
          items: updatedItems
        }
      }
    });
  };

  const removeEducationItem = (index: number) => {
    const updatedItems = [...education.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        education: {
          ...education,
          items: updatedItems
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="education-enabled">Enable Education Section</Label>
        <Switch 
          id="education-enabled" 
          checked={education.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {education.enabled && (
        <>
          <div>
            <Label htmlFor="education-title">Section Title</Label>
            <Input 
              id="education-title" 
              value={education.title} 
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Education Items</h3>
            
            {education.items.map((item, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">{item.institution || `Education ${index + 1}`}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeEducationItem(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`institution-${index}`}>Institution</Label>
                    <Input 
                      id={`institution-${index}`} 
                      value={item.institution} 
                      onChange={(e) => updateEducationItem(index, "institution", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                    <Input 
                      id={`degree-${index}`} 
                      value={item.degree} 
                      onChange={(e) => updateEducationItem(index, "degree", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`period-${index}`}>Period</Label>
                    <Input 
                      id={`period-${index}`} 
                      value={item.period} 
                      onChange={(e) => updateEducationItem(index, "period", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`edu-description-${index}`}>Description (Optional)</Label>
                    <Textarea 
                      id={`edu-description-${index}`} 
                      value={item.description || ""} 
                      onChange={(e) => updateEducationItem(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              type="button" 
              onClick={addEducationItem} 
              className="w-full mt-2"
            >
              Add Education
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EducationEditor;
