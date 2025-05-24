
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
  private accessToken: string | null = null;

  // Initialize GitHub OAuth flow
  async authenticate(): Promise<void> {
    const clientId = 'Ov23liZQK9TuSVrxZuox'; // GitHub OAuth App client ID
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'repo user';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    // Open popup for GitHub OAuth
    const popup = window.open(authUrl, 'github-auth', 'width=600,height=700');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      // Listen for the callback
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          this.accessToken = event.data.token;
          window.removeEventListener('message', handleMessage);
          resolve();
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  // Get current user info
  async getUser(): Promise<GitHubUser> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  // Create a new repository
  async createRepository(name: string, description: string): Promise<GitHubRepo> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: false,
        auto_init: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repository');
    }

    return response.json();
  }

  // Upload files to repository
  async uploadFiles(owner: string, repo: string, files: { path: string; content: string }[]): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Upload files sequentially to avoid rate limiting
    for (const file of files) {
      await this.uploadFile(owner, repo, file.path, file.content);
      // Small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async uploadFile(owner: string, repo: string, path: string, content: string): Promise<void> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add ${path}`,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to upload ${path}: ${error.message}`);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Logout
  logout(): void {
    this.accessToken = null;
  }
}

export const githubService = new GitHubService();
