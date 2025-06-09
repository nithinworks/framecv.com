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
            Learn more about our mission and what drives us at FrameCV.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <div className="text-base text-muted-foreground space-y-4 text-left w-full">
            <p>
              FrameCV is your go-to platform for transforming resumes into
              stunning, professional portfolios in minutes. We believe everyone
              deserves a beautiful online presence, and our mission is to make
              that effortless.
            </p>
            <p>
              Our goal is to provide a seamless and intuitive experience for
              building and deploying your portfolio, powered by modern web
              technologies and AI.
            </p>
            <p>
              Whether you're a developer, designer, or student, FrameCV helps
              you showcase your work and achievements beautifully. Fast, free,
              and fully customizable—deploy to GitHub Pages with one click and
              own your online presence.
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
              <div className="text-sm text-muted-foreground">CEO, FrameCV</div>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
};

export default About;
