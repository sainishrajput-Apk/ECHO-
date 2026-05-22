from git import Repo

def analyze_repo(repo_path):
    try:
        repo = Repo(repo_path)
        commits = list(repo.iter_commits('HEAD', max_count=100))
        patterns = []
        for commit in commits:
            msg = commit.message.lower()
            if any(k in msg for k in ['fix', 'bug', 'revert', 'patch', 'hotfix', 'repair']):
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
                    'diff_preview': '\n'.join(diff)[:500]
                })
        return patterns
    except Exception as e:
        return []
    