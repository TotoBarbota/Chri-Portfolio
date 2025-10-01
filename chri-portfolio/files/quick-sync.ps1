# Quick Sync to GitHub (No Prompts)
# This script syncs all changes without asking for confirmation

# Get directories
$FilesDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $FilesDir

# Change to repository root
Set-Location $RepoRoot

# Check Git configuration
Write-Host "Checking Git configuration..." -ForegroundColor Cyan

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host "✗ Git user not configured" -ForegroundColor Red
    Write-Host ""
    
    if (-not $gitUserName) {
        Write-Host "Enter your Git username (e.g., 'John Doe'):" -ForegroundColor Yellow
        $newUserName = Read-Host "Username"
        if ([string]::IsNullOrWhiteSpace($newUserName)) {
            Write-Host "✗ Username cannot be empty" -ForegroundColor Red
            exit 1
        }
        git config --global user.name "$newUserName"
        Write-Host "✓ Git username set to: $newUserName" -ForegroundColor Green
    }
    
    if (-not $gitUserEmail) {
        Write-Host "Enter your Git email (e.g., 'john@example.com'):" -ForegroundColor Yellow
        $newUserEmail = Read-Host "Email"
        if ([string]::IsNullOrWhiteSpace($newUserEmail)) {
            Write-Host "✗ Email cannot be empty" -ForegroundColor Red
            exit 1
        }
        git config --global user.email "$newUserEmail"
        Write-Host "✓ Git email set to: $newUserEmail" -ForegroundColor Green
    }
    
    Write-Host ""
} else {
    Write-Host "✓ Git configured as: $gitUserName <$gitUserEmail>" -ForegroundColor Green
}

# Fetch latest changes from remote
Write-Host "Checking remote repository..." -ForegroundColor Cyan
git fetch origin --quiet

# Get current branch
$currentBranch = git branch --show-current

# Check if local is behind remote
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/$currentBranch 2>$null

if ($remoteCommit -and $localCommit -ne $remoteCommit) {
    # Check if we can fast-forward
    $mergeBase = git merge-base HEAD origin/$currentBranch
    
    if ($mergeBase -eq $localCommit) {
        # Local is behind, can fast-forward
        Write-Host "Pulling latest changes..." -ForegroundColor Yellow
        git pull origin $currentBranch --ff-only
        Write-Host "✓ Updated to latest version" -ForegroundColor Green
    }
    elseif ($mergeBase -ne $remoteCommit) {
        # Branches have diverged
        Write-Host "✗ Error: Local and remote have diverged" -ForegroundColor Red
        Write-Host "Please resolve conflicts manually:" -ForegroundColor Yellow
        Write-Host "  git pull origin $currentBranch" -ForegroundColor Cyan
        exit 1
    }
}

# Check for changes
$status = git status --porcelain

if (-not $status) {
    Write-Host "No changes to sync" -ForegroundColor Green
    exit 0
}

# Add, commit, and push
Write-Host "Syncing changes to GitHub..." -ForegroundColor Cyan
Write-Host "Including: Projects, Blogs, Pictures, Blog-Images, and Resume" -ForegroundColor DarkGray

git add files/
$commitMessage = "Update content: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage
git push origin $currentBranch

Write-Host "✓ Synced successfully!" -ForegroundColor Green
