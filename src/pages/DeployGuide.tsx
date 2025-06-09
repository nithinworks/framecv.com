import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

const DeployGuide = () => {
  return (
    <>
      <LandingHeader isLoaded={true} />
      <main className="min-h-[60vh] bg-background text-foreground flex flex-col items-center py-12 px-4">
        <article className="w-full max-w-2xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              How to Deploy Your FrameCV Portfolio
            </h1>
            <div className="flex justify-center items-center gap-2 text-muted-foreground text-xs mb-3">
              <span>By FrameCV Team</span>
              <span>&middot;</span>
              <time dateTime="2024-01-01">
                {new Date().toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Learn how to deploy your FrameCV portfolio to Vercel, Netlify, or
              GitHub Pages. This guide covers step-by-step instructions, tips,
              and troubleshooting for a smooth launch.
            </p>
          </header>
          <section className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-7 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
              <p>
                FrameCV lets you export your portfolio as static files. You can
                deploy these files to any static hosting provider. Below are
                guides for the most popular options.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Deploy to Vercel</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Download your portfolio as a ZIP from FrameCV.</li>
                <li>Unzip the files to a folder on your computer.</li>
                <li>
                  Go to{" "}
                  <a
                    href="https://vercel.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    vercel.com
                  </a>{" "}
                  and sign in.
                </li>
                <li>
                  Click <b>New Project</b> &rarr; <b>Import</b> your project
                  from GitHub, or use <b>Import Project</b> &rarr; <b>Other</b>{" "}
                  to upload your static files.
                </li>
                <li>
                  Follow the prompts. For static sites, Vercel will auto-detect
                  and deploy your site.
                </li>
                <li>
                  Once deployed, you'll get a live URL to share your portfolio.
                </li>
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Deploy to Netlify</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Download your portfolio as a ZIP from FrameCV.</li>
                <li>Unzip the files to a folder on your computer.</li>
                <li>
                  Go to{" "}
                  <a
                    href="https://netlify.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    netlify.com
                  </a>{" "}
                  and sign in.
                </li>
                <li>
                  Click <b>Add new site</b> &rarr; <b>Deploy manually</b>.
                </li>
                <li>
                  Drag and drop your unzipped folder into the upload area.
                </li>
                <li>
                  Netlify will build and deploy your site, giving you a live
                  URL.
                </li>
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Deploy to GitHub Pages
              </h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Use the <b>Deploy</b> button in FrameCV's builder to push your
                  portfolio to a new GitHub repository.
                </li>
                <li>FrameCV will set up GitHub Pages for you automatically.</li>
                <li>
                  After a few minutes, your portfolio will be live at{" "}
                  <code>https://your-username.github.io/your-repo/</code>.
                </li>
                <li>
                  If you want to deploy manually, upload your static files to a{" "}
                  <b>gh-pages</b> branch and enable GitHub Pages in your repo
                  settings.
                </li>
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Tips & Troubleshooting
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  For custom domains, follow your provider's instructions to
                  connect your domain.
                </li>
                <li>
                  If you see a blank page, make sure your{" "}
                  <code>index.html</code> is in the root of your deployed
                  folder.
                </li>
                <li>
                  GitHub Pages may take a few minutes to update after
                  deployment.
                </li>
                <li>Contact FrameCV support if you need help!</li>
              </ul>
            </div>
            <p className="italic text-muted-foreground mt-8">
              You can edit this page to add more sections, images, or code
              blocks as needed.
            </p>
          </section>
        </article>
      </main>
      <LandingFooter />
    </>
  );
};

export default DeployGuide;
