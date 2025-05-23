
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X, FileText, ListChecks, Bookmark } from "lucide-react";

const AboutEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { about } = sections;

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          enabled
        }
      }
    });
  };

  const handleChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          [field]: value
        }
      }
    });
  };

  const handleSkillsEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          skills: {
            ...about.skills,
            enabled
          }
        }
      }
    });
  };

  const handleSkillsTitleChange = (title: string) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          skills: {
            ...about.skills,
            title
          }
        }
      }
    });
  };

  const handleAddSkill = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          skills: {
            ...about.skills,
            items: [...about.skills.items, ""]
          }
        }
      }
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...about.skills.items];
    updatedSkills[index] = value;

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          skills: {
            ...about.skills,
            items: updatedSkills
          }
        }
      }
    });
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...about.skills.items];
    updatedSkills.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...about,
          skills: {
            ...about.skills,
            items: updatedSkills
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="about-enabled">Show About Section</Label>
        <Switch 
          id="about-enabled" 
          checked={about.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {about.enabled && (
        <>
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="about-title">Section Title</Label>
                <Input 
                  id="about-title" 
                  placeholder="About Me"
                  value={about.title} 
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-1">
              <FileText className="w-4 h-4 text-gray-500 mt-2" />
              <div className="w-full">
                <Label htmlFor="about-content">About Text</Label>
                <Textarea 
                  id="about-content" 
                  placeholder="Write about yourself, your experience, and what you're passionate about."
                  value={about.content} 
                  onChange={(e) => handleChange("content", e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ListChecks className="w-4 h-4 text-gray-500" />
                <Label htmlFor="skills-enabled">Show Skills</Label>
              </div>
              <Switch 
                id="skills-enabled" 
                checked={about.skills.enabled}
                onCheckedChange={handleSkillsEnabledChange}
              />
            </div>

            {about.skills.enabled && (
              <>
                <div className="mb-4 flex items-center space-x-3">
                  <Bookmark className="w-4 h-4 text-gray-500" />
                  <div className="w-full">
                    <Label htmlFor="skills-title">Skills Title</Label>
                    <Input 
                      id="skills-title" 
                      placeholder="Skills & Technologies"
                      value={about.skills.title} 
                      onChange={(e) => handleSkillsTitleChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="block mb-2">Skills List</Label>
                  {about.skills.items.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
                      <Input 
                        value={skill} 
                        placeholder={`Skill #${index + 1}, e.g. JavaScript`}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveSkill(index)}
                        className="p-1 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleAddSkill} 
                    className="w-full mt-3"
                    size="sm"
                  >
                    Add Skill
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AboutEditor;
