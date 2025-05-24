
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

  // Authenticate user with GitHub
  async authenticate(): Promise<GitHubUser> {
    const scope = 'repo user';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scope}&state=${Date.now()}`;
    
    // Open popup for GitHub OAuth
    const popup = window.open(authUrl, 'github-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled by user'));
        }
      }, 1000);

      // Listen for the callback
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          this.userToken = event.data.token;
          window.removeEventListener('message', handleMessage);
          
          // Get user info and resolve
          this.getUser().then(resolve).catch(reject);
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  // Get current user info
  async getUser(): Promise<GitHubUser> {
    if (!this.userToken) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'getUser',
        userToken: this.userToken
      }
    });

    if (error) throw new Error(error.message || 'Failed to fetch user info');
    
    this.currentUser = data;
    return data;
  }

  // Create a new repository
  async createRepository(name: string, description: string): Promise<GitHubRepo> {
    if (!this.userToken) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'createRepository',
        userToken: this.userToken,
        name,
        description
      }
    });

    if (error) throw new Error(error.message || 'Failed to create repository');
    return data;
  }

  // Upload files to repository
  async uploadFiles(owner: string, repo: string, files: { path: string; content: string }[]): Promise<void> {
    if (!this.userToken) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'uploadFiles',
        userToken: this.userToken,
        owner,
        repo,
        files
      }
    });

    if (error) throw new Error(error.message || 'Failed to upload files');
  }

  // Enable GitHub Pages
  async enablePages(owner: string, repo: string): Promise<void> {
    if (!this.userToken) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase.functions.invoke('github-publish', {
      body: { 
        action: 'enablePages',
        userToken: this.userToken,
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
