import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { FileText } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <>
      <LandingHeader isLoaded={true} />
      <main className="min-h-[60vh] bg-background text-foreground flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            By using FrameCV, you agree to these terms. Please read them
            carefully.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <FileText className="w-10 h-10 text-purple-500 mb-4" />
          <ul className="text-left text-muted-foreground space-y-4 text-base">
            <li>
              <b>Acceptance:</b> Using FrameCV means you accept these terms.
            </li>
            <li>
              <b>Changes:</b> We may update these terms at any time. Continued
              use means you accept the changes.
            </li>
            <li>
              <b>Usage:</b> Do not misuse our service or attempt to disrupt it.
            </li>
            <li>
              <b>Contact:</b> For questions, email{" "}
              <a
                href="mailto:contact@framecv.com"
                className="text-blue-500 underline"
              >
                contact@framecv.com
              </a>
              .
            </li>
          </ul>
        </div>
      </main>
      <LandingFooter />
    </>
  );
};

export default TermsAndConditions;
