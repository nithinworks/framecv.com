
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProjectsHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({
  title,
  onTitleChange,
}) => {
  return (
    <div>
      <Label htmlFor="projects-title">Section Title</Label>
      <Input 
        id="projects-title" 
        value={title} 
        onChange={(e) => onTitleChange(e.target.value)}
      />
    </div>
  );
};

export default ProjectsHeader;
