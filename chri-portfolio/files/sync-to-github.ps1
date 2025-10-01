# Sync Files to GitHub Repository
# This script syncs all content in the files folder to the GitHub repository
# Requires: Git, GitHub CLI (will attempt to install if missing)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Content Sync Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to install a package using winget
function Install-WithWinget {
    param($PackageId, $PackageName)
    
    Write-Host "→ Installing $PackageName..." -ForegroundColor Yellow
    try {
        winget install --id $PackageId --silent --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $PackageName installed successfully" -ForegroundColor Green
            # Refresh PATH environment variable
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            return $true
        } else {
            Write-Host "✗ Failed to install $PackageName" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Error installing $PackageName: $_" -ForegroundColor Red
        return $false
    }
}

# Check if running with administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Get the script's directory (files folder)
$FilesDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Get the repository root (one level up from files folder)
$RepoRoot = Split-Path -Parent $FilesDir

# Change to repository root
Set-Location $RepoRoot
Write-Host "Repository: $RepoRoot" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check if winget is available
$wingetAvailable = Test-CommandExists "winget"
if (-not $wingetAvailable) {
    Write-Host "⚠ Warning: winget not found - cannot auto-install missing tools" -ForegroundColor Yellow
    Write-Host "  winget comes with Windows 11 and Windows 10 (with App Installer)" -ForegroundColor DarkGray
    Write-Host ""
}

# Check for Git
$gitInstalled = Test-CommandExists "git"
if (-not $gitInstalled) {
    Write-Host "✗ Git is not installed" -ForegroundColor Red
    
    if ($wingetAvailable) {
        Write-Host ""
        $installGit = Read-Host "Would you like to install Git now? (Y/N)"
        if ($installGit -eq 'Y' -or $installGit -eq 'y') {
            if (-not $isAdmin) {
                Write-Host "⚠ Note: Installing without admin rights (user-level install)" -ForegroundColor Yellow
            }
            $success = Install-WithWinget "Git.Git" "Git"
            if (-not $success) {
                Write-Host ""
                Write-Host "Please install Git manually from: https://git-scm.com/downloads" -ForegroundColor Yellow
                pause
                exit 1
            }
            # Verify installation
            Start-Sleep -Seconds 2
            $gitInstalled = Test-CommandExists "git"
            if (-not $gitInstalled) {
                Write-Host "⚠ Git installed but not in PATH yet. Please restart your terminal." -ForegroundColor Yellow
                pause
                exit 1
            }
        } else {
            Write-Host "Git is required. Please install from: https://git-scm.com/downloads" -ForegroundColor Yellow
            pause
            exit 1
        }
    } else {
        Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
        pause
        exit 1
    }
}

$gitVersion = git --version
Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green

# Check for GitHub CLI
$ghInstalled = Test-CommandExists "gh"
if (-not $ghInstalled) {
    Write-Host "✗ GitHub CLI is not installed" -ForegroundColor Yellow
    
    if ($wingetAvailable) {
        Write-Host ""
        $installGh = Read-Host "Would you like to install GitHub CLI now? (Y/N)"
        if ($installGh -eq 'Y' -or $installGh -eq 'y') {
            if (-not $isAdmin) {
                Write-Host "⚠ Note: Installing without admin rights (user-level install)" -ForegroundColor Yellow
            }
            $success = Install-WithWinget "GitHub.cli" "GitHub CLI"
            if (-not $success) {
                Write-Host ""
                Write-Host "Please install GitHub CLI manually from: https://cli.github.com/" -ForegroundColor Yellow
                Write-Host "⚠ Warning: Without GitHub CLI, authentication might be more complex" -ForegroundColor Yellow
            } else {
                # Verify installation
                Start-Sleep -Seconds 2
                $ghInstalled = Test-CommandExists "gh"
                if (-not $ghInstalled) {
                    Write-Host "⚠ GitHub CLI installed but not in PATH yet. Please restart your terminal." -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "GitHub CLI can make authentication easier: https://cli.github.com/" -ForegroundColor DarkGray
    }
}

if ($ghInstalled) {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Host "✓ GitHub CLI found: $ghVersion" -ForegroundColor Green
    
    # Check GitHub authentication status
    Write-Host ""
    Write-Host "Checking GitHub authentication..." -ForegroundColor Cyan
    
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Not authenticated with GitHub" -ForegroundColor Yellow
        Write-Host ""
        $authenticate = Read-Host "Would you like to authenticate now? (Y/N)"
        if ($authenticate -eq 'Y' -or $authenticate -eq 'y') {
            Write-Host ""
            Write-Host "Starting GitHub authentication..." -ForegroundColor Cyan
            Write-Host "This will open your browser to complete authentication." -ForegroundColor DarkGray
            Write-Host ""
            
            gh auth login --web --git-protocol https
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Successfully authenticated with GitHub" -ForegroundColor Green
            } else {
                Write-Host "✗ Authentication failed or was cancelled" -ForegroundColor Red
                Write-Host "You can authenticate later by running: gh auth login" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠ Skipping authentication - push to GitHub may fail" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✓ Already authenticated with GitHub" -ForegroundColor Green
        # Show account info
        $authStatus | Select-String "Logged in to" | ForEach-Object { 
            Write-Host "  $_" -ForegroundColor DarkGray 
        }
    }
}

Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "✗ Error: Not a git repository" -ForegroundColor Red
    Write-Host "Please run this script from within the repository" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Checking remote repository..." -ForegroundColor Cyan

# Fetch latest changes from remote
git fetch origin --quiet

# Get current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Check if local is behind remote
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/$currentBranch 2>$null

if ($remoteCommit -and $localCommit -ne $remoteCommit) {
    # Check if we can fast-forward
    $mergeBase = git merge-base HEAD origin/$currentBranch
    
    if ($mergeBase -eq $localCommit) {
        # Local is behind, can fast-forward
        Write-Host "" 
        Write-Host "⚠ Your local repository is behind the remote" -ForegroundColor Yellow
        Write-Host ""
        $pull = Read-Host "Pull latest changes before syncing? (Y/N)"
        if ($pull -eq 'Y' -or $pull -eq 'y') {
            Write-Host ""
            Write-Host "→ Pulling latest changes..." -ForegroundColor White
            git pull origin $currentBranch --ff-only
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Updated to latest version" -ForegroundColor Green
            } else {
                Write-Host "✗ Error pulling changes" -ForegroundColor Red
                pause
                exit 1
            }
        } else {
            Write-Host "⚠ Warning: Proceeding without pulling may cause push to fail" -ForegroundColor Yellow
        }
    }
    elseif ($mergeBase -ne $remoteCommit) {
        # Branches have diverged
        Write-Host "" 
        Write-Host "✗ Error: Local and remote branches have diverged" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means you have local commits that conflict with remote commits." -ForegroundColor Yellow
        Write-Host "You need to resolve this manually:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Option 1 - Merge remote changes:" -ForegroundColor Cyan
        Write-Host "    git pull origin $currentBranch" -ForegroundColor White
        Write-Host ""
        Write-Host "  Option 2 - Rebase your changes:" -ForegroundColor Cyan
        Write-Host "    git pull --rebase origin $currentBranch" -ForegroundColor White
        Write-Host ""
        pause
        exit 1
    }
}

Write-Host ""
Write-Host "Checking for changes..." -ForegroundColor Cyan

# Check git status
$status = git status --porcelain

if (-not $status) {
    Write-Host "✓ No changes to commit" -ForegroundColor Green
    Write-Host ""
    Write-Host "All files are already up to date!" -ForegroundColor Green
    pause
    exit 0
}

# Show changes
Write-Host ""
Write-Host "Found changes in:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────" -ForegroundColor DarkGray
git status --short
Write-Host "─────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to sync these changes to GitHub? (Y/N)"
if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host ""
    Write-Host "Sync cancelled by user" -ForegroundColor Yellow
    pause
    exit 0
}

Write-Host ""
Write-Host "Syncing changes..." -ForegroundColor Cyan
Write-Host ""

# Add all changes in the files directory
Write-Host "→ Adding changes..." -ForegroundColor White
git add files/

# Check if there are staged changes
$stagedChanges = git diff --cached --name-only

if (-not $stagedChanges) {
    Write-Host "✓ No changes to commit after staging" -ForegroundColor Green
    pause
    exit 0
}

# Show what will be committed
Write-Host ""
Write-Host "Files to be committed:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────" -ForegroundColor DarkGray
$stagedChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
Write-Host "─────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Ask for commit message
$defaultMessage = "Update content: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Cyan
Write-Host "Default: $defaultMessage" -ForegroundColor DarkGray
$commitMessage = Read-Host "Message"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = $defaultMessage
}

# Commit changes
Write-Host ""
Write-Host "→ Committing changes..." -ForegroundColor White
try {
    git commit -m $commitMessage
    Write-Host "✓ Changes committed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error committing changes: $_" -ForegroundColor Red
    pause
    exit 1
}

# Push to remote
Write-Host ""
Write-Host "Pushing to branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""
Write-Host "→ Pushing to GitHub..." -ForegroundColor White
try {
    git push origin $currentBranch
    Write-Host "✓ Changes pushed to GitHub successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Error pushing to GitHub: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "This might happen if:" -ForegroundColor Yellow
    Write-Host "  1. You're not authenticated with GitHub" -ForegroundColor Yellow
    Write-Host "  2. You don't have push permissions" -ForegroundColor Yellow
    Write-Host "  3. There are conflicts with remote changes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try running: git push origin $currentBranch" -ForegroundColor Cyan
    pause
    exit 1
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Sync Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✓ Changes committed" -ForegroundColor Green
Write-Host "  ✓ Pushed to GitHub ($currentBranch)" -ForegroundColor Green
Write-Host ""
Write-Host "Your content is now synced!" -ForegroundColor Green
Write-Host ""

pause
