
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  github_deploy_status: boolean;
  process_resume_status: boolean;
}

// Cache for feature flags with 5-minute TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedFlags: FeatureFlags | null = null;
let cacheTimestamp: number = 0;

export const useOptimizedFeatureFlags = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    github_deploy_status: true, // Default to enabled
    process_resume_status: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchFeatureFlags = async (useCache = true) => {
    try {
      // Check cache first
      const now = Date.now();
      if (useCache && cachedFlags && (now - cacheTimestamp) < CACHE_TTL) {
        setFeatureFlags(cachedFlags);
        setIsLoading(false);
        return;
      }

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

      const flags = data ? {
        github_deploy_status: data.github_deploy_status,
        process_resume_status: data.process_resume_status,
      } : {
        github_deploy_status: true,
        process_resume_status: true,
      };

      // Update cache
      cachedFlags = flags;
      cacheTimestamp = now;

      if (mounted.current) {
        setFeatureFlags(flags);
      }
    } catch (err) {
      console.error('Feature flags fetch error:', err);
      setError('Failed to load feature flags');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchFeatureFlags();

    // Set up real-time subscription with debouncing
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
          // Invalidate cache and refetch
          cachedFlags = null;
          fetchFeatureFlags(false);
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    featureFlags,
    isLoading,
    error,
    refetch: () => fetchFeatureFlags(false),
  };
};
