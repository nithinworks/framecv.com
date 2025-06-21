
import { useEffect, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useUserDetailsStorage } from "@/hooks/useUserDetailsStorage";
import { useDownloadWithLoading } from "@/hooks/useDownloadWithLoading";

export const useBuilderToolbar = () => {
  const { portfolioData } = usePortfolio();
  const navigate = useNavigate();
  const { featureFlags } = useFeatureFlags();
  const { toast } = useToast();
  const { loadStoredUserData } = useUserDetailsStorage();
  const [showGitHubDeploy, setShowGitHubDeploy] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "download" | "deploy" | "json" | null
  >(null);

  const {
    isLoading: isDownloadLoading,
    showSuccess: showDownloadSuccess,
    downloadType,
    fileName,
    setShowSuccess: setShowDownloadSuccess,
    handleDownloadSourceCode,
    handleDownloadJSON,
  } = useDownloadWithLoading();

  useEffect(() => {
    // Check for GitHub token in URL hash (after OAuth redirect)
    const hash = window.location.hash;
    if (hash.includes("github_token=")) {
      setShowGitHubDeploy(true);
      return;
    }

    // Check for connection errors in URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error") === "github_oauth_failed") {
      toast({
        title: "GitHub Connection Failed",
        description:
          "Unable to connect to GitHub. You can download your portfolio and deploy it manually instead.",
        variant: "destructive",
      });
      // Clean the URL
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [toast]);

  const handleBackClick = () => {
    setShowBackModal(true);
  };

  const handleBackConfirm = () => {
    setShowBackModal(false);
    navigate("/");
  };

  const checkUserDetailsAndProceed = (action: "download" | "json") => {
    const storedData = loadStoredUserData();
    if (storedData) {
      // User has stored details, proceed directly
      if (action === "download") {
        handleDownloadSourceCode();
      } else {
        handleDownloadJSON();
      }
    } else {
      // No stored details, show modal
      setPendingAction(action);
      setShowUserDetails(true);
    }
  };

  const handleDownloadSourceCodeClick = () => {
    checkUserDetailsAndProceed("download");
  };

  const handleDownloadJSONClick = () => {
    checkUserDetailsAndProceed("json");
  };

  const handlePublishClick = () => {
    if (!featureFlags.github_deploy_status) {
      return; // Do nothing if disabled
    }
    setPendingAction("deploy");
    setShowUserDetails(true);
  };

  const handleUserDetailsSuccess = async () => {
    if (pendingAction === "download") {
      await handleDownloadSourceCode();
    } else if (pendingAction === "json") {
      handleDownloadJSON();
    } else if (pendingAction === "deploy") {
      setShowGitHubDeploy(true);
    }
    setPendingAction(null);
  };

  const handleUserDetailsClose = () => {
    setPendingAction(null);
  };

  return {
    portfolioData,
    featureFlags,
    showGitHubDeploy,
    setShowGitHubDeploy,
    showUserDetails,
    setShowUserDetails,
    showBackModal,
    setShowBackModal,
    pendingAction,
    isDownloadLoading,
    showDownloadSuccess,
    downloadType,
    fileName,
    setShowDownloadSuccess,
    handleBackClick,
    handleBackConfirm,
    handleDownloadSourceCodeClick,
    handleDownloadJSONClick,
    handlePublishClick,
    handleUserDetailsSuccess,
    handleUserDetailsClose,
  };
};
