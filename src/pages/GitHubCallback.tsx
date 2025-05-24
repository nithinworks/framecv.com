
import { useEffect } from 'react';

const GitHubCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // Exchange code for access token
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      // In a real app, this should be done on your backend for security
      // For this demo, we'll use a CORS proxy
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'Ov23liZQK9TuSVrxZuox',
          client_secret: 'your-client-secret', // This should be handled on backend
          code: code,
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        // Send token to parent window
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
    
    window.close();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your GitHub authentication...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
