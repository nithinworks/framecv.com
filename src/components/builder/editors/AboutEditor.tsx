
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";

const AboutEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;

  const handleAboutChange = (field: string, value: any) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...sections.about,
          [field]: value
        }
      }
    });
  };

  const handleSkillsChange = (field: string, value: any) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        about: {
          ...sections.about,
          skills: {
            ...sections.about.skills,
            [field]: value
          }
        }
      }
    });
  };

  const addSkill = () => {
    const currentSkills = sections.about.skills?.items || [];
    handleSkillsChange("items", [...currentSkills, "New Skill"]);
  };

  const updateSkill = (index: number, value: string) => {
    const currentSkills = sections.about.skills?.items || [];
    const updatedSkills = currentSkills.map((skill, i) => i === index ? value : skill);
    handleSkillsChange("items", updatedSkills);
  };

  const removeSkill = (index: number) => {
    const currentSkills = sections.about.skills?.items || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    handleSkillsChange("items", updatedSkills);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="aboutTitle" className="text-sm font-medium">Section Title</Label>
          <Input 
            id="aboutTitle"
            value={sections.about.title} 
            onChange={(e) => handleAboutChange("title", e.target.value)}
            placeholder="About Me"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="aboutContent" className="text-sm font-medium">About Me Content</Label>
          <Textarea 
            id="aboutContent"
            value={sections.about.content} 
            onChange={(e) => handleAboutChange("content", e.target.value)}
            placeholder="I'm a passionate developer with experience in building modern web applications..."
            className="mt-1"
            rows={5}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="skills-enabled" className="text-sm font-medium">Skills Section</Label>
          </div>
          <Switch 
            id="skills-enabled"
            checked={sections.about.skills?.enabled || false}
            onCheckedChange={(enabled) => handleSkillsChange("enabled", enabled)}
          />
        </div>

        {sections.about.skills?.enabled && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="skillsTitle" className="text-sm font-medium">Skills Title</Label>
              <Input 
                id="skillsTitle"
                value={sections.about.skills.title} 
                onChange={(e) => handleSkillsChange("title", e.target.value)}
                placeholder="Skills"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Skills List</Label>
                <Button onClick={addSkill} size="sm" variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Skill
                </Button>
              </div>
              
              <div className="space-y-2">
                {(sections.about.skills.items || []).map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={skill} 
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="Enter skill"
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => removeSkill(index)} 
                      size="sm" 
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {(!sections.about.skills.items || sections.about.skills.items.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No skills added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutEditor;
