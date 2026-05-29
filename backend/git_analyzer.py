from git import Repo

def analyze_repo(repo_path, max_commits=500):
    try:
        repo = Repo(repo_path)
        commits = list(repo.iter_commits('HEAD', max_count=max_commits))
        patterns = []
        keywords = ['fix', 'bug', 'revert', 'patch', 'hotfix', 'repair', 'error', 'issue', 'crash', 'broken']
        for commit in commits:
            msg = commit.message.lower()
            if any(k in msg for k in keywords):
                diff = []
                if commit.parents:
                    diffs = commit.parents[0].diff(commit, create_patch=True)
                    for d in diffs:
                        try:
                            diff.append(d.diff.decode('utf-8', errors='ignore'))
                        except:
                            pass
                patterns.append({
                    'hash': commit.hexsha[:8],
                    'message': commit.message.strip(),
                    'author': str(commit.author),
                    'date': commit.committed_datetime.isoformat(),
                    'diff_preview': '\n'.join(diff)[:1000],
                    'files_changed': [item.a_path for item in commit.stats.files]
                })
        return patterns
    except Exception as e:
        print(f"Error analyzing repo: {e}")
        return []