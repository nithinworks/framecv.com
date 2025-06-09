import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <LandingHeader isLoaded={true} />
      <main className="min-h-[60vh] bg-background text-foreground flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your privacy is important to us. Here's how we handle your data at
            FrameCV.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
          <ul className="text-left text-muted-foreground space-y-4 text-base">
            <li>
              <b>Data Collection:</b> We only collect information necessary to
              provide our services.
            </li>
            <li>
              <b>No Third-Party Sharing:</b> We do not share your data with
              third parties without your consent.
            </li>
            <li>
              <b>Security:</b> Your data is protected with industry-standard
              security measures.
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

export default PrivacyPolicy;
