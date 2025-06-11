import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

const About = () => {
  return (
    <>
      <LandingHeader isLoaded={true} />
      <main className="min-h-[60vh] bg-background text-foreground flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About FrameCV</h1>
          <p className="text-lg text-muted-foreground mb-6">
            The story, the belief, and the builder behind FrameCV.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <div className="text-base text-muted-foreground space-y-6 text-left w-full">
            <p>
              <strong>FrameCV</strong> was born out of a simple yet powerful realization: resumes tell, but portfolios show.
            </p>
            <p>
              In a world where everyone’s story looks the same on paper, portfolios give your journey a voice, a vibe, and a visual. Whether you're a student just starting out, a professional switching paths, or a freelancer trying to stand out—having a well-framed portfolio can open doors a resume alone never could. But not everyone knows how to build one. And even fewer have the time or tools to do it well.
            </p>
            <p>
              That’s why we built FrameCV. Drop in your resume, and let our AI turn it into a clean, modern portfolio—instantly. Edit anything in real-time, and either download the full source code or deploy it directly to GitHub Pages. It’s fast, flexible, and <strong>completely free</strong>.
            </p>
            <p>
              Why free? Because not everything valuable should come with a price tag. Great design and great tools should empower everyone—not just those who can afford them. FrameCV is our small way of leveling the playing field.
            </p>
            <p>
              This isn’t some VC-funded startup. It’s a passion project. A tool I wish existed when I started out. And as long as it helps even a few people feel more confident in how they present themselves, it’s done its job.
            </p>
            <p>
              Let FrameCV tell your story. Because you’re more than a resume. You’re a journey in motion—and it’s time people saw it.
            </p>
          </div>
          <div className="w-full flex flex-col items-end mt-10">
            <img
              src="/signature-placeholder.png"
              alt="Signature"
              className="h-12 mb-2 opacity-80"
              style={{ maxWidth: "180px" }}
            />
            <div className="text-right">
              <div className="font-medium text-foreground">Naga Nithin</div>
              <div className="text-sm text-muted-foreground">Creator, FrameCV</div>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
};

export default About;
