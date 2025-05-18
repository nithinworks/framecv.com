
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SettingsEditor from "./editors/SettingsEditor";
import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import ExperienceEditor from "./editors/ExperienceEditor";
import ProjectsEditor from "./editors/ProjectsEditor";
import EducationEditor from "./editors/EducationEditor";
import AchievementsEditor from "./editors/AchievementsEditor";
import ContactEditor from "./editors/ContactEditor";
import SocialEditor from "./editors/SocialEditor";
import NavigationEditor from "./editors/NavigationEditor";
import FooterEditor from "./editors/FooterEditor";

const EditorSidebar: React.FC = () => {
  const { activeSection, setActiveSection, showEditor, setShowEditor } = usePortfolio();

  const sections = [
    { id: "settings", label: "Settings", component: <SettingsEditor /> },
    { id: "hero", label: "Hero", component: <HeroEditor /> },
    { id: "about", label: "About", component: <AboutEditor /> },
    { id: "experience", label: "Experience", component: <ExperienceEditor /> },
    { id: "projects", label: "Projects", component: <ProjectsEditor /> },
    { id: "education", label: "Education", component: <EducationEditor /> },
    { id: "achievements", label: "Achievements", component: <AchievementsEditor /> },
    { id: "contact", label: "Contact", component: <ContactEditor /> },
    { id: "social", label: "Social", component: <SocialEditor /> },
    { id: "navigation", label: "Navigation", component: <NavigationEditor /> },
    { id: "footer", label: "Footer", component: <FooterEditor /> }
  ];

  return (
    <div className={`fixed top-[60px] left-0 bottom-0 w-80 bg-white border-r transition-all duration-300 z-30 overflow-auto ${showEditor ? "" : "-translate-x-full"}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-display font-semibold">Editor</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="settings" value={activeSection} onValueChange={setActiveSection}>
        <div className="px-2 pt-2 border-b overflow-x-auto">
          <TabsList className="inline-flex w-auto overflow-x-auto pb-2 justify-start">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="whitespace-nowrap">
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-4">
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              {section.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default EditorSidebar;
