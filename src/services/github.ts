import type { Integration, GitHubCommit, GitHubUser, GitHubRepo } from '@/types/integrations'

const GH_API = 'https://api.github.com'

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept:        'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// ─────────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────────

export async function getGitHubUser(integration: Integration): Promise<GitHubUser | null> {
  if (!integration.access_token) return null

  const res = await fetch(`${GH_API}/user`, {
    headers: headers(integration.access_token),
    next: { revalidate: 3600 },
  })

  if (!res.ok) return null
  return res.json() as Promise<GitHubUser>
}

// ─────────────────────────────────────────────────────────────
// Repos
// ─────────────────────────────────────────────────────────────

export async function getRepos(
  integration: Integration,
  limit = 10,
): Promise<GitHubRepo[]> {
  if (!integration.access_token) return []

  const url = `${GH_API}/user/repos?sort=updated&per_page=${limit}&affiliation=owner,collaborator`
  const res = await fetch(url, {
    headers: headers(integration.access_token),
    next: { revalidate: 600 },
  })

  if (!res.ok) return []
  return res.json() as Promise<GitHubRepo[]>
}

// ─────────────────────────────────────────────────────────────
// Recent commits (via Events API — push events)
// ─────────────────────────────────────────────────────────────

interface GitHubEvent {
  type:       string
  created_at: string
  repo:       { name: string }
  payload: {
    commits?: Array<{
      sha:     string
      message: string
      url:     string
    }>
  }
}

export async function getRecentCommits(
  integration: Integration,
  limit = 15,
): Promise<GitHubCommit[]> {
  if (!integration.access_token || !integration.provider_user_id) return []

  const login = integration.metadata?.login as string | undefined
        ?? integration.provider_user_id

  const res = await fetch(
    `${GH_API}/users/${encodeURIComponent(login)}/events?per_page=50`,
    {
      headers: headers(integration.access_token),
      next: { revalidate: 300 },
    },
  )

  if (!res.ok) return []

  const events = await res.json() as GitHubEvent[]
  const commits: GitHubCommit[] = []

  for (const event of events) {
    if (event.type !== 'PushEvent') continue
    const repoName = event.repo.name

    for (const commit of event.payload.commits ?? []) {
      commits.push({
        sha:      commit.sha.slice(0, 7),
        message:  commit.message.split('\n')[0],    // first line only
        repo:     repoName,
        html_url: `https://github.com/${repoName}/commit/${commit.sha}`,
        date:     event.created_at,
      })
      if (commits.length >= limit) return commits
    }
  }

  return commits
}
