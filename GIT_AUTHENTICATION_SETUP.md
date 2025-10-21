# Git Authentication Setup for Accorria Projects

## Issue Description
When pushing to GitHub repositories under the Accorria organization, commits were showing as "P-Paths" instead of "Accorria" even when authenticated with the correct GitHub account.

## Root Cause
- Git was configured globally with personal account credentials
- Local repository configuration was not properly set
- GitHub associates commits with email addresses, not just usernames
- Conflicting global and local git configurations

## Solution Steps

### 1. Verify GitHub CLI Authentication
```bash
gh auth status
```
Should show:
- ✅ Logged in to github.com account Accorria (keyring)
- ✅ Active account: true

### 2. Switch to Accorria Account (if needed)
```bash
gh auth switch --user Accorria
```

### 3. Configure Git Credentials for Repository
Set **local** repository configuration (not global):

```bash
# Navigate to project directory
cd "/path/to/your/project"

# Set local git configuration
git config user.name "Accorria"
git config user.email "preston@accorria.com"
```

### 4. Verify Configuration
```bash
git config user.name && git config user.email
```
Should return:
```
Accorria
preston@accorria.com
```

### 5. Test the Configuration
```bash
# Make a test change
echo "Test change" >> README.md

# Commit with new identity
git add README.md
git commit -m "Test commit as Accorria account"

# Verify commit shows correct author
git log --oneline -1 --pretty=format:"%h %an <%ae> %s"
```

Should show:
```
[commit-hash] Accorria <preston@accorria.com> Test commit as Accorria account
```

### 6. Push to GitHub
```bash
git push origin main
```

## Verification on GitHub
- Go to repository commits page
- Filter by author "Accorria"
- Latest commits should show as "Accorria" instead of "P-Paths"

## Important Notes

### Why Local Configuration is Better
- **Global config**: `git config --global` affects all repositories
- **Local config**: `git config` (without --global) affects only current repository
- **Local overrides global**: Local settings take precedence

### Email Address Requirements
- Must use `preston@accorria.com` (not personal email)
- GitHub associates commits with email addresses
- Email must be verified on the Accorria GitHub account

### GitHub CLI Setup
```bash
# Configure git to use GitHub CLI for authentication
git config --global credential.helper "gh auth git-credential"

# Alternative: Use GitHub CLI setup
gh auth setup-git
```

## Troubleshooting

### If Commits Still Show as P-Paths
1. Check current configuration:
   ```bash
   git config --list | grep user
   ```

2. Remove conflicting global settings:
   ```bash
   git config --global --unset user.name
   git config --global --unset user.email
   ```

3. Set local configuration again:
   ```bash
   git config user.name "Accorria"
   git config user.email "preston@accorria.com"
   ```

### If Push Fails with Authentication Error
1. Verify GitHub CLI authentication:
   ```bash
   gh auth status
   ```

2. Re-authenticate if needed:
   ```bash
   gh auth login
   ```

3. Switch to correct account:
   ```bash
   gh auth switch --user Accorria
   ```

## Commands Summary
```bash
# Essential commands for Accorria project setup
cd "/path/to/accorria/project"
git config user.name "Accorria"
git config user.email "preston@accorria.com"
git config --global credential.helper "gh auth git-credential"
gh auth switch --user Accorria
```

## Date Created
October 20, 2025

## Related Files
- Repository: Accorria/Unlimited-Auto-Project
- Issue: Commits showing as P-Paths instead of Accorria
- Solution: Local git configuration with Accorria credentials
