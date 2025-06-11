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
            Your privacy matters. Here's how FrameCV respects and protects your data.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
          <ul className="text-left text-muted-foreground space-y-6 text-base">
            <li>
              <b>1. Data Collection:</b> We only collect minimal, necessary information to provide a smooth experience. Your uploaded resume is processed locally and temporarily for conversion purposes—it’s not stored or tracked.
            </li>
            <li>
              <b>2. Live Edits:</b> Any edits you make on your portfolio are stored only in your current session or browser (via local storage). We don’t save your content on our servers.
            </li>
            <li>
              <b>3. No Third-Party Sharing:</b> We don’t sell, rent, or share your personal data or documents with any third parties—ever.
            </li>
            <li>
              <b>4. Deployment to GitHub:</b> If you choose to publish your portfolio to GitHub Pages, your GitHub token is used securely for that session only. We never save or reuse your credentials.
            </li>
            <li>
              <b>5. Security:</b> All communication with FrameCV is encrypted over HTTPS. We take reasonable measures to protect against unauthorized access.
            </li>
            <li>
              <b>6. Your Control:</b> You are always in control of your content. You can choose to export your portfolio, reset your edits, or clear your session at any time.
            </li>
            <li>
              <b>7. Contact:</b> If you have any questions or concerns about privacy, reach out at{" "}
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
