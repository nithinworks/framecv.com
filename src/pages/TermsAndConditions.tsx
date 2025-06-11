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
            By using FrameCV, you agree to these terms. Please read them carefully.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <FileText className="w-10 h-10 text-purple-500 mb-4" />
          <ul className="text-left text-muted-foreground space-y-6 text-base">
            <li>
              <b>1. Acceptance of Terms:</b> By accessing or using FrameCV, you confirm that you have read, understood, and agree to be bound by these terms.
            </li>
            <li>
              <b>2. Usage:</b> You agree to use FrameCV responsibly. You may not use the service for illegal activities, abuse the platform, or attempt to interfere with its functionality.
            </li>
            <li>
              <b>3. Content Ownership:</b> You retain full ownership of the content you upload or generate. FrameCV does not claim any rights over your data or portfolio files.
            </li>
            <li>
              <b>4. Temporary Storage:</b> Any resumes or edits processed are handled temporarily in your browser/session. We don’t permanently store your data.
            </li>
            <li>
              <b>5. Deployments:</b> If you choose to deploy your portfolio to GitHub, you are responsible for ensuring your repository complies with GitHub’s terms of service.
            </li>
            <li>
              <b>6. Changes to Terms:</b> We may update these terms occasionally. If we do, we’ll reflect that here. Continued use after changes means you accept the updated terms.
            </li>
            <li>
              <b>7. No Warranty:</b> FrameCV is provided “as is” with no guarantees. While we aim for a smooth experience, we cannot promise the service will be error-free or available at all times.
            </li>
            <li>
              <b>8. Contact:</b> If you have any questions or concerns about these terms, feel free to reach out at{" "}
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
