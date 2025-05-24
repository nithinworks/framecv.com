
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const GitHubCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_ERROR',
        error: errorDescription || error
      }, window.location.origin);
    } else if (code) {
      // Exchange code for token using our edge function
      exchangeCodeForToken(code);
    } else {
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
    }
  }, [searchParams]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      // In a real app, you'd exchange this code for a token on your backend
      // For now, we'll use the GitHub token from Supabase secrets
      // This is a simplified flow - in production you'd want proper OAuth flow
      
      const response = await fetch(`https://github.com/login/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'Ov23liZQK9TuSVrxZuox',
          client_secret: 'your_client_secret', // This should be handled on backend
          code: code,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      
      if (data.access_token) {
        window.opener?.postMessage({
          type: 'GITHUB_AUTH_SUCCESS',
          token: data.access_token
        }, window.location.origin);
      } else {
        throw new Error(data.error_description || 'Failed to get access token');
      }
    } catch (error) {
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_ERROR',
        error: error instanceof Error ? error.message : 'Authentication failed'
      }, window.location.origin);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing GitHub Authentication</h2>
        <p className="text-gray-600">Please wait while we complete the authentication process...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
