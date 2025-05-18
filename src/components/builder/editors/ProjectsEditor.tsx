
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash } from "lucide-react";

const ProjectsEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { projects } = sections;

  // Toggle section enabled
  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
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
        projects: {
          ...projects,
          title
        }
      }
    });
  };

  // Add new project
  const addProject = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
          items: [
            ...projects.items,
            {
              title: "New Project",
              description: "Description of the project",
              tags: ["Tag 1", "Tag 2"],
              previewUrl: "#"
            }
          ]
        }
      }
    });
  };

  // Update project field
  const updateProject = (index: number, field: string, value: string | string[]) => {
    const updatedItems = [...projects.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
          items: updatedItems
        }
      }
    });
  };

  // Remove project
  const removeProject = (index: number) => {
    const updatedItems = [...projects.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
          items: updatedItems
        }
      }
    });
  };

  // Add tag to project
  const addTag = (projectIndex: number) => {
    const updatedItems = [...projects.items];
    updatedItems[projectIndex] = {
      ...updatedItems[projectIndex],
      tags: [...updatedItems[projectIndex].tags, "New Tag"]
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
          items: updatedItems
        }
      }
    });
  };

  // Update tag in project
  const updateTag = (projectIndex: number, tagIndex: number, value: string) => {
    const updatedItems = [...projects.items];
    const updatedTags = [...updatedItems[projectIndex].tags];
    updatedTags[tagIndex] = value;
    
    updatedItems[projectIndex] = {
      ...updatedItems[projectIndex],
      tags: updatedTags
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
          items: updatedItems
        }
      }
    });
  };

  // Remove tag from project
  const removeTag = (projectIndex: number, tagIndex: number) => {
    const updatedItems = [...projects.items];
    const updatedTags = [...updatedItems[projectIndex].tags];
    updatedTags.splice(tagIndex, 1);
    
    updatedItems[projectIndex] = {
      ...updatedItems[projectIndex],
      tags: updatedTags
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        projects: {
          ...projects,
          items: updatedItems
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="projects-enabled">Enable Projects Section</Label>
        <Switch 
          id="projects-enabled" 
          checked={projects.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {projects.enabled && (
        <>
          <div>
            <Label htmlFor="projects-title">Section Title</Label>
            <Input 
              id="projects-title" 
              value={projects.title} 
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Projects</h3>
            
            {projects.items.map((project, index) => (
              <div key={index} className="mb-6 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">{project.title || `Project ${index + 1}`}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeProject(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`project-title-${index}`}>Title</Label>
                    <Input 
                      id={`project-title-${index}`} 
                      value={project.title} 
                      onChange={(e) => updateProject(index, "title", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`project-description-${index}`}>Description</Label>
                    <Textarea 
                      id={`project-description-${index}`} 
                      value={project.description} 
                      onChange={(e) => updateProject(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`project-url-${index}`}>Preview URL</Label>
                    <Input 
                      id={`project-url-${index}`} 
                      value={project.previewUrl} 
                      onChange={(e) => updateProject(index, "previewUrl", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Tags</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => addTag(index)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Tag
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {project.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="flex items-center gap-2">
                          <Input 
                            value={tag} 
                            onChange={(e) => updateTag(index, tagIndex, e.target.value)}
                            className="text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTag(index, tagIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
        </>
      )}
    </div>
  );
};

export default ProjectsEditor;
