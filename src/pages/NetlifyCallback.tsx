
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
      console.log('Netlify callback received');
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Callback params:', { 
        hasCode: !!code, 
        error, 
        errorDescription,
        fullCode: code 
      });

      if (error) {
        console.error('Netlify OAuth error:', error, errorDescription);
        toast.error('Authorization failed', {
          description: `Failed to connect to Netlify: ${errorDescription || error}`
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
        console.log('Exchanging code for access token...', code.substring(0, 10) + '...');
        
        // Call edge function with code as URL parameter instead of body
        const { data, error: functionError } = await supabase.functions.invoke('netlify-oauth', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }, {
          // Pass code as URL parameter
          query: { code }
        });

        console.log('Token exchange result:', { data, error: functionError });

        if (functionError) {
          console.error('Edge function error:', functionError);
          toast.error('Authorization failed', {
            description: functionError.message || 'Failed to exchange authorization code.'
          });
          navigate('/builder');
          return;
        }

        if (!data?.access_token) {
          console.error('No access token received:', data);
          toast.error('Authorization failed', {
            description: 'No access token received from Netlify.'
          });
          navigate('/builder');
          return;
        }

        // Store access token in session storage
        sessionStorage.setItem('netlify_access_token', data.access_token);
        console.log('Access token stored successfully');
        
        toast.success('Connected to Netlify!', {
          description: 'You can now deploy your portfolio to Netlify.'
        });

        // Redirect back to builder
        navigate('/builder');

      } catch (error) {
        console.error('Callback processing error:', error);
        toast.error('Authorization failed', {
          description: 'An unexpected error occurred during authorization.'
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
