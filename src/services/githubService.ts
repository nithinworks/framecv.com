
import { supabase } from "@/integrations/supabase/client";

export interface GitHubRepo {
  name: string;
  html_url: string;
  clone_url: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
}

class GitHubService {
  // Get current session token
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  // Check if user has connected their GitHub account
  async checkAuthentication(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.log('No auth token available');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: { 
          action: 'checkUserToken'
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (error) {
        console.error('Error checking GitHub authentication:', error);
        return false;
      }
      return data?.hasToken || false;
    } catch (error) {
      console.error('Error checking GitHub authentication:', error);
      return false;
    }
  }

  // Exchange OAuth code for access token
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.error('No auth token available for code exchange');
        return false;
      }

      console.log('Exchanging code for token with auth token present:', !!token);

      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: { 
          action: 'exchangeCode',
          code
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message);
      }
      return data?.success || false;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

  // Get current user info using their stored token
  async getUser(): Promise<GitHubUser> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const { data, error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'getUser'
      },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (error) throw new Error(error.message || 'Failed to fetch user info');
    return data;
  }

  // Create a new repository using user's token
  async createRepository(name: string, description: string): Promise<GitHubRepo> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const { data, error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'createRepository',
        name,
        description
      },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (error) throw new Error(error.message || 'Failed to create repository');
    return data;
  }

  // Upload files to repository using user's token
  async uploadFiles(owner: string, repo: string, files: { path: string; content: string }[]): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const { error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'uploadFiles',
        owner,
        repo,
        files
      },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (error) throw new Error(error.message || 'Failed to upload files');
  }

  // Disconnect GitHub account
  async disconnectAccount(): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const { error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'disconnect'
      },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (error) throw new Error(error.message || 'Failed to disconnect account');
  }
}

export const githubService = new GitHubService();
