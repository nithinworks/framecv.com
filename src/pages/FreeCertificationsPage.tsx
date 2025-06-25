import { useEffect, useState } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ArrowUp } from "lucide-react";
import certificationsData from "@/data/free-certifications.json";

interface Course {
  name: string;
  provider: string;
  url: string;
}

interface TechData {
  tech: string;
  courses: Course[];
}

interface CertificationsData {
  [key: string]: TechData[];
}

const CircularNav = ({
  alphabet,
  onLetterClick,
  currentLetter,
}: {
  alphabet: string[];
  onLetterClick: (letter: string) => void;
  currentLetter: string;
}) => {
  const numLetters = alphabet.length;
  const radius = 130;

  return (
    <div className="relative h-72 w-72 mx-auto my-8">
      <div className="absolute inset-0 rounded-full border border-border/50" />
      {alphabet.map((letter, i) => {
        const angleRad = (i / numLetters) * 2 * Math.PI - Math.PI / 2;
        const x = radius * Math.cos(angleRad);
        const y = radius * Math.sin(angleRad);
        const isActive = currentLetter === letter;

        return (
          <Button
            key={letter}
            variant="ghost"
            onClick={() => onLetterClick(letter)}
            className={`absolute left-1/2 top-1/2 h-9 w-9 rounded-full p-0 transition-all duration-300
              ${
                isActive
                  ? "scale-110 bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            {letter}
          </Button>
        );
      })}
    </div>
  );
};

const FreeCertificationsPage = () => {
  const [certifications] = useState<CertificationsData>(certificationsData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLetter, setCurrentLetter] = useState("A");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const alphabet = Object.keys(certifications).sort();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentLetter(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -60% 0px",
      }
    );

    alphabet.forEach((letter) => {
      const el = document.getElementById(letter);
      if (el) observer.observe(el);
    });

    return () => {
      alphabet.forEach((letter) => {
        const el = document.getElementById(letter);
        if (el) observer.unobserve(el);
      });
    };
  }, [alphabet]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120; // Adjusted offset for better spacing with sticky header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed bottom-0 left-0 z-0 transition-all duration-500"
        aria-hidden="true"
      >
        <span className="text-[24rem] font-black text-border/5">
          {currentLetter}
        </span>
      </div>

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
            Free Certifications Directory
          </h1>
          <p
            className={`delay-300 mt-4 text-lg text-muted-foreground transition-all duration-1000 ${
              isLoaded ? "animate-blur-in" : "blur-md opacity-0"
            }`}
          >
            A curated list of free online certifications to boost your skills.
          </p>
        </div>

        <div className="sticky top-20 z-10 mb-12">
          {/* Desktop Nav */}
          <div className="hidden flex-wrap justify-center gap-2 rounded-full border border-border bg-background/80 px-4 py-3 backdrop-blur-md md:flex">
            {alphabet.map((letter) => (
              <Button
                key={letter}
                variant="ghost"
                onClick={() => scrollTo(letter)}
                className="rounded-full px-4 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {letter}
              </Button>
            ))}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <CircularNav
              alphabet={alphabet}
              onLetterClick={scrollTo}
              currentLetter={currentLetter}
            />
          </div>
        </div>

        <div className="space-y-20">
          {alphabet.map((letter) => (
            <div key={letter} id={letter} className="scroll-mt-32">
              <h2 className="relative mb-8 text-3xl font-bold tracking-tighter text-foreground">
                <span className="relative z-10">{letter}</span>
                <span className="absolute -left-4 -top-8 -z-0 text-7xl font-black text-border opacity-50">
                  {letter}
                </span>
              </h2>
              <div className="space-y-12">
                {certifications[letter].map((tech, index) => (
                  <div key={index}>
                    <h3 className="mb-6 text-2xl font-semibold tracking-tight text-muted-foreground">
                      {tech.tech}
                    </h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
                      {tech.courses.map((course, cIndex) => (
                        <a
                          key={cIndex}
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block transform rounded-xl border border-border bg-muted/20 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20"
                        >
                          <h4 className="text-lg font-bold text-foreground group-hover:text-primary">
                            {course.name}
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Provider: {course.provider}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <LandingFooter />

      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full p-0 shadow-lg"
          variant="secondary"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default FreeCertificationsPage;
