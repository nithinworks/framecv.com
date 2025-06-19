
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WaitlistPage from "./components/WaitlistPage";
import Index from "./pages/Index";
import Builder from "./pages/Builder";
   import NotFound from "./pages/NotFound";
// import About from "./pages/About";
// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import DeployGuide from "./pages/DeployGuide";
// import TermsAndConditions from "./pages/TermsAndConditions";
// import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<WaitlistPage />} />  */}
          {/* Commented out routes for later activation */}
           <Route path="/" element={<Index />} />
         <Route path="/builder" element={<Builder />} />
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
          {/* <Route path="/terms" element={<TermsAndConditions />} /> */}
          {/* <Route path="/deploy-guide" element={<DeployGuide />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="*" element={<NotFound />} /> 
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
