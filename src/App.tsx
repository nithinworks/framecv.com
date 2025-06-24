
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WaitlistPage from "./components/WaitlistPage";
import Index from "./pages/Index";
import Builder from "./pages/Builder";
import NotFound from "./pages/NotFound";
import PageTransitionLoader from "./components/ui/page-transition";
import ThemesPage from "./components/ThemesPage";
import ReportIssuePage from "./components/ReportIssuePage";

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
          <Routes>
        {/* <Route path="/" element={<WaitlistPage />} />*/}
           <Route path="/" element={<Index />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/report-issue" element={<ReportIssuePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
           <Route path="/terms" element={<TermsAndConditions />} />
            {/* <Route path="/deploy-guide" element={<DeployGuide />} /> */}
          <Route path="/contact" element={<Contact />} /> 
            <Route path="*" element={<NotFound />} /> 
          </Routes>
        </PageTransitionLoader>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
