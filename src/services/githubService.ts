
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
  private userToken: string | null = null;
  private currentUser: GitHubUser | null = null;

  // GitHub OAuth App details (you'll need to set these up)
  private clientId = 'Ov23liZQK9TuSVrxZuox'; // Replace with your GitHub OAuth App client ID
  private redirectUri = `${window.location.origin}/auth/github/callback`;

  // Check if GitHub token is configured in Supabase
  async checkAuthentication(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('github-publish', {
        body: { 
          action: 'checkToken'
        }
      });

      if (error) return false;
      return data?.isConfigured || false;
    } catch (error) {
      console.error('Error checking GitHub authentication:', error);
      return false;
    }
  }

  // Get current user info
  async getUser(): Promise<GitHubUser> {
    const { data, error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'getUser'
      }
    });

    if (error) throw new Error(error.message || 'Failed to fetch user info');
    
    this.currentUser = data;
    return data;
  }

  // Create a new repository
  async createRepository(name: string, description: string): Promise<GitHubRepo> {
    const { data, error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'createRepository',
        name,
        description
      }
    });

    if (error) throw new Error(error.message || 'Failed to create repository');
    return data;
  }

  // Upload files to repository
  async uploadFiles(owner: string, repo: string, files: { path: string; content: string }[]): Promise<void> {
    const { error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'uploadFiles',
        owner,
        repo,
        files
      }
    });

    if (error) throw new Error(error.message || 'Failed to upload files');
  }

  // Enable GitHub Pages
  async enablePages(owner: string, repo: string): Promise<void> {
    const { error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'enablePages',
        owner,
        repo
      }
    });

    // Don't throw error for pages setup failure
    if (error) {
      console.warn('GitHub Pages setup warning:', error.message);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.userToken && !!this.currentUser;
  }

  // Get current user (if cached)
  getCurrentUser(): GitHubUser | null {
    return this.currentUser;
  }

  // Logout
  logout(): void {
    this.userToken = null;
    this.currentUser = null;
  }
}

export const githubService = new GitHubService();
