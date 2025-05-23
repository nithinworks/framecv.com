
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, User, Brain, Briefcase, FolderOpen, GraduationCap, Mail, Settings } from "lucide-react";
import SettingsEditor from "./editors/SettingsEditor";
import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import ExperienceEditor from "./editors/ExperienceEditor";
import ProjectsEditor from "./editors/ProjectsEditor";
import EducationEditor from "./editors/EducationEditor";
import ContactEditor from "./editors/ContactEditor";

const EditorSidebar: React.FC = () => {
  const { activeSection, setActiveSection, showEditor, setShowEditor } = usePortfolio();

  const sections = [
    { id: "hero", label: "Personal Info", component: <HeroEditor />, icon: User },
    { id: "about", label: "Skills", component: <AboutEditor />, icon: Brain },
    { id: "experience", label: "Experience", component: <ExperienceEditor />, icon: Briefcase },
    { id: "projects", label: "Projects", component: <ProjectsEditor />, icon: FolderOpen },
    { id: "education", label: "Education", component: <EducationEditor />, icon: GraduationCap },
    { id: "contact", label: "Contact", component: <ContactEditor />, icon: Mail },
    { id: "settings", label: "Settings", component: <SettingsEditor />, icon: Settings }
  ];

  const currentSection = sections.find(section => section.id === activeSection) || sections[0];

  return (
    <div className={`fixed top-[60px] left-0 bottom-0 w-80 bg-white border-r transition-all duration-300 z-30 overflow-hidden ${showEditor ? "" : "-translate-x-full"}`}>
      <div className="flex justify-between items-center px-3 py-2 border-b">
        <h3 className="font-medium text-sm">Portfolio Editor</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)} className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-60px-41px)]">
        {/* Side Navigation */}
        <div className="w-11 border-r bg-gray-50 flex flex-col items-center py-1.5 space-y-0.5">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-1.5 rounded-md transition-colors ${
                  activeSection === section.id 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
                title={section.label}
              >
                <IconComponent className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="px-3 py-2 border-b flex-shrink-0">
            <h4 className="font-medium text-sm">{currentSection.label}</h4>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {currentSection.component}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebar;
