
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ProjectsHeaderProps {
  enabled: boolean;
  title: string;
  onEnabledChange: (enabled: boolean) => void;
  onTitleChange: (title: string) => void;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({
  enabled,
  title,
  onEnabledChange,
  onTitleChange,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="projects-enabled">Enable Projects Section</Label>
        <Switch 
          id="projects-enabled" 
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div>
          <Label htmlFor="projects-title">Section Title</Label>
          <Input 
            id="projects-title" 
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
      )}
    </>
  );
};

export default ProjectsHeader;
