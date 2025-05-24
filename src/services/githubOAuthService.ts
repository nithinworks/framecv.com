
export class GitHubOAuthService {
  private clientId: string;
  private redirectUri: string;

  constructor() {
    // This will be set from environment/config
    this.clientId = 'Ov23liZQK9TuSVrxZuox'; // This should come from your GitHub OAuth App
    this.redirectUri = 'https://framecv.com/auth/github/callback'; // Fixed to your production domain
  }

  // Start OAuth flow
  initiateOAuth(): void {
    const scope = 'repo'; // Permission to create repositories
    const state = this.generateState();
    localStorage.setItem('github_oauth_state', state);
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scope}&state=${state}`;
    
    console.log('GitHub OAuth URL:', authUrl);
    console.log('Client ID:', this.clientId);
    console.log('Redirect URI:', this.redirectUri);
    
    // Open in the same window to avoid popup issues
    window.location.href = authUrl;
  }

  // Generate random state for OAuth security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Validate state to prevent CSRF attacks
  validateState(receivedState: string): boolean {
    const storedState = localStorage.getItem('github_oauth_state');
    localStorage.removeItem('github_oauth_state');
    return storedState === receivedState;
  }
}

export const githubOAuthService = new GitHubOAuthService();
