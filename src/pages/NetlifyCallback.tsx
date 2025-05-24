
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NetlifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Netlify OAuth error:', error);
        toast.error('Authorization failed', {
          description: 'Failed to connect to Netlify. Please try again.'
        });
        navigate('/builder');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        toast.error('Authorization failed', {
          description: 'No authorization code received from Netlify.'
        });
        navigate('/builder');
        return;
      }

      try {
        // Exchange code for access token
        const { data, error } = await supabase.functions.invoke('netlify-oauth', {
          body: { code }
        });

        if (error || !data?.access_token) {
          console.error('Token exchange failed:', error);
          toast.error('Authorization failed', {
            description: 'Failed to exchange authorization code.'
          });
          navigate('/builder');
          return;
        }

        // Store access token in session storage
        sessionStorage.setItem('netlify_access_token', data.access_token);
        
        toast.success('Connected to Netlify!', {
          description: 'You can now deploy your portfolio to Netlify.'
        });

        // Redirect back to builder
        navigate('/builder');

      } catch (error) {
        console.error('Callback processing error:', error);
        toast.error('Authorization failed', {
          description: 'An unexpected error occurred.'
        });
        navigate('/builder');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Connecting to Netlify</h2>
          <p className="text-gray-600">Please wait while we complete the authorization...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default NetlifyCallback;
