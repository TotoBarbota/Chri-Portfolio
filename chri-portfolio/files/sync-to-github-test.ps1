# Sync Files to GitHub Repository - Test Version
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

# Check for Git
$gitInstalled = Test-CommandExists "git"
if (-not $gitInstalled) {
    Write-Host "[X] Git is not installed" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    pause
    exit 1
}

$gitVersion = git --version
Write-Host "[OK] Git found: $gitVersion" -ForegroundColor Green

Write-Host ""
Write-Host "Checking Git configuration..." -ForegroundColor Cyan

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host "[X] Git user information not configured" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[OK] Git configured as: $gitUserName <$gitUserEmail>" -ForegroundColor Green
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
    $mergeBase = git merge-base HEAD origin/$currentBranch
    
    if ($mergeBase -eq $localCommit) {
        Write-Host "" 
        Write-Host "[!] Your local repository is behind the remote" -ForegroundColor Yellow
        Write-Host ""
        $pull = Read-Host "Pull latest changes before syncing? (Y/N)"
        if ($pull -eq 'Y' -or $pull -eq 'y') {
            Write-Host ""
            Write-Host "-> Pulling latest changes..." -ForegroundColor White
            git pull origin $currentBranch --ff-only
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Updated to latest version" -ForegroundColor Green
            } else {
                Write-Host "[X] Error pulling changes" -ForegroundColor Red
                pause
                exit 1
            }
        }
    }
}

# Function to sanitize filename
function Get-SanitizedFilename {
    param($Filename)
    
    $sanitized = $Filename -replace ':', '--'
    $sanitized = $sanitized -replace '[^a-zA-Z0-9_.-]', '-'
    
    while ($sanitized -match '---') {
        $sanitized = $sanitized -replace '---', '--'
    }
    
    $sanitized = $sanitized -replace '^-+|-+$', ''
    
    return $sanitized
}

# Function to validate and rename files in a directory
function Repair-FilenamesInDirectory {
    param($Directory, $Extensions)
    
    $renamedFiles = @()
    
    Get-ChildItem -Path $Directory -File | Where-Object {
        $Extensions -contains $_.Extension
    } | ForEach-Object {
        $file = $_
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $extension = $file.Extension
        $sanitized = Get-SanitizedFilename $baseName
        
        if ($baseName -ne $sanitized) {
            $newName = "$sanitized$extension"
            $newPath = Join-Path $Directory $newName
            
            if (Test-Path $newPath) {
                Write-Host "[!] Warning: Cannot rename '$($file.Name)' to '$newName' - target exists" -ForegroundColor Yellow
            } else {
                Write-Host "-> Renaming: '$($file.Name)' -> '$newName'" -ForegroundColor Yellow
                Rename-Item -Path $file.FullName -NewName $newName -Force
                $renamedFiles += $newName
            }
        }
    }
    
    return $renamedFiles
}

Write-Host ""
Write-Host "Validating filenames..." -ForegroundColor Cyan
Write-Host ""

$renamedCount = 0

# Check Projects folder
$projectsDir = Join-Path $FilesDir "Projects"
if (Test-Path $projectsDir) {
    $renamed = Repair-FilenamesInDirectory $projectsDir @('.pdf', '.description')
    $renamedCount += $renamed.Count
}

# Check Blogs folder
$blogsDir = Join-Path $FilesDir "Blogs"
if (Test-Path $blogsDir) {
    $renamed = Repair-FilenamesInDirectory $blogsDir @('.md', '.description')
    $renamedCount += $renamed.Count
}

# Check Blog-Images folder
$blogImagesDir = Join-Path $FilesDir "Blog-Images"
if (Test-Path $blogImagesDir) {
    $renamed = Repair-FilenamesInDirectory $blogImagesDir @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp')
    $renamedCount += $renamed.Count
}

# Check Pictures folder
$picturesDir = Join-Path $FilesDir "Pictures"
if (Test-Path $picturesDir) {
    $renamed = Repair-FilenamesInDirectory $picturesDir @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp')
    $renamedCount += $renamed.Count
}

if ($renamedCount -gt 0) {
    Write-Host "[OK] Fixed $renamedCount filename(s)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] All filenames are valid" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Checking for changes..." -ForegroundColor Cyan

# Check git status
$status = git status --porcelain

if (-not $status) {
    Write-Host "[OK] No changes to commit" -ForegroundColor Green
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
Write-Host "-> Adding changes..." -ForegroundColor White
git add files/

# Check if there are staged changes
$stagedChanges = git diff --cached --name-only

if (-not $stagedChanges) {
    Write-Host "[OK] No changes to commit after staging" -ForegroundColor Green
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
Write-Host "-> Committing changes..." -ForegroundColor White
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Changes committed successfully" -ForegroundColor Green
} else {
    Write-Host "[X] Error committing changes" -ForegroundColor Red
    pause
    exit 1
}

# Push to remote
Write-Host ""
Write-Host "Pushing to branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""
Write-Host "-> Pushing to GitHub..." -ForegroundColor White
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Changes pushed to GitHub successfully!" -ForegroundColor Green
} else {
    Write-Host "[X] Error pushing to GitHub" -ForegroundColor Red
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
Write-Host "  [OK] Changes committed" -ForegroundColor Green
Write-Host "  [OK] Pushed to GitHub ($currentBranch)" -ForegroundColor Green
Write-Host ""
Write-Host "Your content is now synced!" -ForegroundColor Green
Write-Host ""

pause
