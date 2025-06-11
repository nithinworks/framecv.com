import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <>
      <LandingHeader isLoaded={true} />
      <main className="min-h-[60vh] bg-background text-foreground flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Have a question, feature request, or just want to say hi? We're always happy to hear from you.
          </p>
        </div>
        <div className="max-w-lg w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <Mail className="w-10 h-10 text-green-500 mb-4" />
          <p className="text-base text-muted-foreground mb-2">Drop us an email at</p>
          <a
            href="mailto:contact@framecv.com"
            className="text-blue-500 underline text-lg font-medium mb-4"
          >
            contact@framecv.com
          </a>
          <p className="text-sm text-muted-foreground text-center">
            Whether it's feedback, a bug, or just a thank-you note — we genuinely read everything. We'll get back to you within 24 hours.
          </p>
        </div>
      </main>
      <LandingFooter />
    </>
  );
};

export default Contact;
