import { ElementType, useEffect, useState } from "react";
import {
  Briefcase,
  Building,
  Globe,
  GraduationCap,
  Icon,
  User,
  Users,
} from "lucide-react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import jobDirectoriesData from "@/data/job-directories.json";

interface Portal {
  name: string;
  url: string;
}

interface JobDirectory {
  id: string;
  title: string;
  icon: string;
  description: string;
  portals: Portal[];
}

const iconMap: { [key: string]: ElementType } = {
  Briefcase,
  Globe,
  GraduationCap,
  Building,
  Users,
  User,
};

const JobPortalsDirectory = () => {
  const [directories] = useState<JobDirectory[]>(jobDirectoriesData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader isLoaded={isLoaded} />
      <main className="container mx-auto min-h-screen px-4 py-16 pt-32">
        <div className="mb-16 text-center">
          <h1
            className={`text-4xl font-bold tracking-tighter transition-all duration-1000 md:text-5xl ${
              isLoaded
                ? "animate-blur-in bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent"
                : "blur-md opacity-0"
            }`}
          >
            Job Portals Directory
          </h1>
          <p
            className={`delay-300 mt-4 text-lg text-muted-foreground transition-all duration-1000 ${
              isLoaded ? "animate-blur-in" : "blur-md opacity-0"
            }`}
          >
            A curated list of job portals to help you find your next
            opportunity.
          </p>
        </div>

        <div className="mx-auto max-w-5xl space-y-12">
          {directories.map((directory) => {
            const IconComponent = iconMap[directory.icon];
            return (
              <div
                key={directory.id}
                className="rounded-xl border border-border bg-muted/20 p-6"
              >
                <div className="mb-4 flex items-center gap-4">
                  {IconComponent && (
                    <IconComponent className="h-8 w-8 text-primary" />
                  )}
                  <h2 className="text-xl font-bold text-foreground">
                    {directory.title}
                  </h2>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  {directory.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {directory.portals.map((portal) => (
                    <a
                      key={portal.name}
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10"
                    >
                      {portal.name}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default JobPortalsDirectory;
