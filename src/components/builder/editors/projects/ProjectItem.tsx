
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Plus, X } from "lucide-react";

interface ProjectItemProps {
  project: {
    title: string;
    description: string;
    tags: string[];
    previewUrl: string;
  };
  index: number;
  onUpdate: (index: number, field: string, value: string | string[]) => void;
  onRemove: (index: number) => void;
  onAddTag: (projectIndex: number) => void;
  onUpdateTag: (projectIndex: number, tagIndex: number, value: string) => void;
  onRemoveTag: (projectIndex: number, tagIndex: number) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  index,
  onUpdate,
  onRemove,
  onAddTag,
  onUpdateTag,
  onRemoveTag,
}) => {
  return (
    <div className="mb-6 p-4 border rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold">{project.title || `Project ${index + 1}`}</h4>
        <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor={`project-title-${index}`}>Title</Label>
          <Input 
            id={`project-title-${index}`} 
            value={project.title} 
            onChange={(e) => onUpdate(index, "title", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor={`project-description-${index}`}>Description</Label>
          <Textarea 
            id={`project-description-${index}`} 
            value={project.description} 
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor={`project-url-${index}`}>Preview URL</Label>
          <Input 
            id={`project-url-${index}`} 
            value={project.previewUrl} 
            onChange={(e) => onUpdate(index, "previewUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Tags</Label>
            <Button variant="ghost" size="sm" onClick={() => onAddTag(index)}>
              <Plus className="h-3 w-3 mr-1" /> Add Tag
            </Button>
          </div>
          
          <div className="space-y-2">
            {project.tags.map((tag, tagIndex) => (
              <div key={tagIndex} className="flex items-center gap-2">
                <Input 
                  value={tag} 
                  onChange={(e) => onUpdateTag(index, tagIndex, e.target.value)}
                  className="text-xs"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveTag(index, tagIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
