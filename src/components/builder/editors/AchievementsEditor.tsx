
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

const AchievementsEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { achievements } = sections;

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        achievements: {
          ...achievements,
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
        achievements: {
          ...achievements,
          title
        }
      }
    });
  };

  const addAchievement = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        achievements: {
          ...achievements,
          items: [
            ...achievements.items,
            {
              title: "New Achievement",
              period: "MM/YYYY",
              description: "Description of your achievement"
            }
          ]
        }
      }
    });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updatedItems = [...achievements.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        achievements: {
          ...achievements,
          items: updatedItems
        }
      }
    });
  };

  const removeAchievement = (index: number) => {
    const updatedItems = [...achievements.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        achievements: {
          ...achievements,
          items: updatedItems
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="achievements-enabled">Enable Achievements Section</Label>
        <Switch 
          id="achievements-enabled" 
          checked={achievements.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {achievements.enabled && (
        <>
          <div>
            <Label htmlFor="achievements-title">Section Title</Label>
            <Input 
              id="achievements-title" 
              value={achievements.title} 
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Achievements & Certifications</h3>
            
            {achievements.items.map((item, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">{item.title || `Achievement ${index + 1}`}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAchievement(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`achievement-title-${index}`}>Title</Label>
                    <Input 
                      id={`achievement-title-${index}`} 
                      value={item.title} 
                      onChange={(e) => updateAchievement(index, "title", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`achievement-period-${index}`}>Period</Label>
                    <Input 
                      id={`achievement-period-${index}`} 
                      value={item.period} 
                      onChange={(e) => updateAchievement(index, "period", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`achievement-description-${index}`}>Description</Label>
                    <Textarea 
                      id={`achievement-description-${index}`} 
                      value={item.description} 
                      onChange={(e) => updateAchievement(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              type="button" 
              onClick={addAchievement} 
              className="w-full mt-2"
            >
              Add Achievement
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AchievementsEditor;
