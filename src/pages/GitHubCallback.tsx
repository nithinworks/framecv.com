
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GitHubCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This callback is no longer needed since we're using token-based auth
    // Redirect back to the builder
    navigate('/builder');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you back to the portfolio builder...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
