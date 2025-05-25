
import React from "react";
import { Button } from "@/components/ui/button";
import ProjectsHeader from "./projects/ProjectsHeader";
import ProjectItem from "./projects/ProjectItem";
import { useProjectsEditor } from "@/hooks/useProjectsEditor";

const ProjectsEditor: React.FC = () => {
  const {
    projects,
    handleEnabledChange,
    handleTitleChange,
    addProject,
    updateProject,
    removeProject,
    addTag,
    updateTag,
    removeTag,
  } = useProjectsEditor();

  return (
    <div className="space-y-6">
      <ProjectsHeader
        enabled={projects.enabled}
        title={projects.title}
        onEnabledChange={handleEnabledChange}
        onTitleChange={handleTitleChange}
      />

      {projects.enabled && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Projects</h3>
          
          {projects.items.map((project, index) => (
            <ProjectItem
              key={index}
              project={project}
              index={index}
              onUpdate={updateProject}
              onRemove={removeProject}
              onAddTag={addTag}
              onUpdateTag={updateTag}
              onRemoveTag={removeTag}
            />
          ))}
          
          <Button 
            variant="outline" 
            type="button" 
            onClick={addProject} 
            className="w-full mt-2"
          >
            Add Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsEditor;
