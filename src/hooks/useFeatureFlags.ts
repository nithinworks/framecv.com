
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  github_deploy_status: boolean;
  process_resume_status: boolean;
}

export const useFeatureFlags = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    github_deploy_status: true, // Default to enabled while loading
    process_resume_status: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatureFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('github_deploy_status, process_resume_status')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching feature flags:', error);
        setError('Failed to load feature flags');
        return;
      }

      if (data) {
        setFeatureFlags({
          github_deploy_status: data.github_deploy_status,
          process_resume_status: data.process_resume_status,
        });
      }
    } catch (err) {
      console.error('Feature flags fetch error:', err);
      setError('Failed to load feature flags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureFlags();

    // Set up real-time subscription to listen for feature flag changes
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => {
          // Refetch feature flags when they change
          fetchFeatureFlags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    featureFlags,
    isLoading,
    error,
    refetch: fetchFeatureFlags,
  };
};
