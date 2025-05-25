
import { usePortfolio } from "@/context/PortfolioContext";

export const useProjectsEditor = () => {
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

  return {
    projects,
    handleEnabledChange,
    handleTitleChange,
    addProject,
    updateProject,
    removeProject,
    addTag,
    updateTag,
    removeTag,
  };
};
