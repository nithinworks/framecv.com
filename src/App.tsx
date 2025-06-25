import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageTransitionLoader from "./components/ui/page-transition";
import { BrandedLoader } from "./components/ui/branded-loader";
import { Suspense, lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const Builder = lazy(() => import("./pages/Builder"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ThemesPage = lazy(() => import("./components/ThemesPage"));
const ReportIssuePage = lazy(() => import("./components/ReportIssuePage"));
const FreeCertificationsPage = lazy(
  () => import("./pages/FreeCertificationsPage")
);
const JobPortalsDirectory = lazy(() => import("./pages/JobPortalsDirectory"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <PageTransitionLoader>
          <Suspense fallback={<BrandedLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/themes" element={<ThemesPage />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route
                path="/free-certifications"
                element={<FreeCertificationsPage />}
              />
              <Route path="/job-portals" element={<JobPortalsDirectory />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageTransitionLoader>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
