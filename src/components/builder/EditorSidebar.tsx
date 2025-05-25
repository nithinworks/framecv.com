
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

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

  const sidebarClasses = isMobile 
    ? `fixed top-14 left-0 right-0 bottom-0 bg-[#171717] z-30 transition-all duration-300 ${showEditor ? "" : "-translate-x-full"}`
    : `fixed top-14 left-0 bottom-0 w-96 bg-[#171717] border-r border-gray-800 transition-all duration-300 z-30 overflow-hidden ${showEditor ? "" : "-translate-x-full"}`;

  return (
    <div className={sidebarClasses}>
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <h3 className="font-medium text-sm text-white">Portfolio Editor</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowEditor(false)} 
          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-110px)] min-h-0">
        {/* Side Navigation */}
        <div className={`${isMobile ? 'w-12' : 'w-16'} border-r border-gray-800 bg-[#0f0f0f] flex flex-col items-center py-4 space-y-2 flex-shrink-0`}>
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${isMobile ? 'p-2' : 'p-2.5'} rounded-lg transition-all duration-300 ${
                  activeSection === section.id 
                    ? 'bg-white text-black' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                }`}
                title={section.label}
              >
                <IconComponent className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
            <h4 className="font-medium text-sm text-white">{currentSection.label}</h4>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className={`${isMobile ? 'p-3' : 'p-4'} space-y-4`}>
              {currentSection.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebar;
