
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
  // Check if user has connected their GitHub account
  async checkAuthentication(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: { 
          action: 'checkUserToken'
        }
      });

      if (error) return false;
      return data?.hasToken || false;
    } catch (error) {
      console.error('Error checking GitHub authentication:', error);
      return false;
    }
  }

  // Exchange OAuth code for access token
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: { 
          action: 'exchangeCode',
          code
        }
      });

      if (error) throw new Error(error.message);
      return data?.success || false;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

  // Get current user info using their stored token
  async getUser(): Promise<GitHubUser> {
    const { data, error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'getUser'
      }
    });

    if (error) throw new Error(error.message || 'Failed to fetch user info');
    return data;
  }

  // Create a new repository using user's token
  async createRepository(name: string, description: string): Promise<GitHubRepo> {
    const { data, error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'createRepository',
        name,
        description
      }
    });

    if (error) throw new Error(error.message || 'Failed to create repository');
    return data;
  }

  // Upload files to repository using user's token
  async uploadFiles(owner: string, repo: string, files: { path: string; content: string }[]): Promise<void> {
    const { error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'uploadFiles',
        owner,
        repo,
        files
      }
    });

    if (error) throw new Error(error.message || 'Failed to upload files');
  }

  // Disconnect GitHub account
  async disconnectAccount(): Promise<void> {
    const { error } = await supabase.functions.invoke('github-oauth', {
      body: { 
        action: 'disconnect'
      }
    });

    if (error) throw new Error(error.message || 'Failed to disconnect account');
  }
}

export const githubService = new GitHubService();
