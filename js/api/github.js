// GitHub API integration
async function fetchGitHubRepos(portfolioData) {
  try {
    const username = portfolioData.githubUsername;
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    
    if (!response.ok) {
      console.error('Failed to fetch GitHub repos:', response.status);
      portfolioData.projects = [{
        name: 'luciancj.github.io',
        desc: 'Terminal Portfolio Website',
        link: 'https://github.com/luciancj/luciancj.github.io',
        repo: 'luciancj/luciancj.github.io'
      }];
      return true;
    }
    
    const repos = await response.json();
    
    portfolioData.projects = repos.map(repo => ({
      name: repo.name,
      desc: repo.description || 'No description available',
      link: repo.html_url,
      repo: repo.full_name,
      stars: repo.stargazers_count,
      language: repo.language,
      updated: new Date(repo.updated_at).toLocaleDateString()
    }));
    
    console.log(`Loaded ${portfolioData.projects.length} repositories from GitHub`);
    return true;
    
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    portfolioData.projects = [{
      name: 'luciancj.github.io',
      desc: 'Terminal Portfolio Website',
      link: 'https://github.com/luciancj/luciancj.github.io',
      repo: 'luciancj/luciancj.github.io'
    }];
    return true;
  }
}
