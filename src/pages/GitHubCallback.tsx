
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { githubOAuthService } from '@/services/githubOAuthService';
import { githubService } from '@/services/githubService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GitHubCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('GitHub callback received:', { 
          code: !!code, 
          codeLength: code?.length,
          state: !!state, 
          error,
          fullUrl: window.location.href 
        });

        if (error) {
          throw new Error(`GitHub OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Validate state to prevent CSRF attacks
        if (!githubOAuthService.validateState(state)) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        console.log('State validated successfully, checking user authentication...');
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('User not authenticated. Please log in first.');
        }

        console.log('User is authenticated, exchanging code for token...');
        
        // Exchange code for access token
        const success = await githubService.exchangeCodeForToken(code);
        
        console.log('Token exchange result:', success);
        
        if (success) {
          setStatus('success');
          toast({
            title: "GitHub Connected!",
            description: "Your GitHub account has been successfully connected.",
          });
          
          // Redirect to builder after a short delay
          setTimeout(() => {
            navigate('/builder');
          }, 2000);
        } else {
          throw new Error('Failed to exchange code for token - check Supabase secrets and authentication');
        }
      } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to connect GitHub account";
        setErrorDetails(errorMessage);
        setStatus('error');
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Redirect to builder after a short delay
        setTimeout(() => {
          navigate('/builder');
        }, 5000);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Connecting GitHub...</h2>
            <p className="text-gray-600">Please wait while we connect your GitHub account.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-800">GitHub Connected!</h2>
            <p className="text-gray-600">Redirecting you back to the portfolio builder...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">Connection Failed</h2>
            <p className="text-gray-600 mb-2">There was an issue connecting your GitHub account.</p>
            {errorDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600 font-medium">Error Details:</p>
                <p className="text-sm text-red-600">{errorDetails}</p>
                <p className="text-xs text-red-500 mt-2">
                  Make sure you're logged in and check Supabase Edge Function logs for more details.
                </p>
              </div>
            )}
            <p className="text-gray-600">You'll be redirected back to the builder shortly.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;
