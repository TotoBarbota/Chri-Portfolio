# Quick Sync to GitHub (No Prompts)
# This script syncs all changes without asking for confirmation

# Get directories
$FilesDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $FilesDir)

# Change to repository root
Set-Location $RepoRoot

# Check Git configuration
Write-Host "Checking Git configuration..." -ForegroundColor Cyan

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host "[X] Git user not configured" -ForegroundColor Red
    Write-Host ""
    
    if (-not $gitUserName) {
        Write-Host "Enter your Git username (e.g., 'John Doe'):" -ForegroundColor Yellow
        $newUserName = Read-Host "Username"
        if ([string]::IsNullOrWhiteSpace($newUserName)) {
            Write-Host "[X] Username cannot be empty" -ForegroundColor Red
            exit 1
        }
        git config --global user.name "$newUserName"
        Write-Host "[OK] Git username set to: $newUserName" -ForegroundColor Green
    }
    
    if (-not $gitUserEmail) {
        Write-Host "Enter your Git email (e.g., 'john@example.com'):" -ForegroundColor Yellow
        $newUserEmail = Read-Host "Email"
        if ([string]::IsNullOrWhiteSpace($newUserEmail)) {
            Write-Host "[X] Email cannot be empty" -ForegroundColor Red
            exit 1
        }
        git config --global user.email "$newUserEmail"
        Write-Host "[OK] Git email set to: $newUserEmail" -ForegroundColor Green
    }
    
    Write-Host ""
} else {
    Write-Host "[OK] Git configured as: $gitUserName <$gitUserEmail>" -ForegroundColor Green
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
        Write-Host "[OK] Updated to latest version" -ForegroundColor Green
    }
    elseif ($mergeBase -ne $remoteCommit) {
        # Branches have diverged
        Write-Host "[X] Error: Local and remote have diverged" -ForegroundColor Red
        Write-Host "Please resolve conflicts manually:" -ForegroundColor Yellow
        Write-Host "  git pull origin $currentBranch" -ForegroundColor Cyan
        exit 1
    }
}

# Function to sanitize filename
function Get-SanitizedFilename {
    param($Filename)
    
    # Replace colons with double dash
    $sanitized = $Filename -replace ':', '--'
    
    # Replace spaces and other invalid chars with single dash
    $sanitized = $sanitized -replace '[^a-zA-Z0-9_.-]', '-'
    
    # Remove consecutive dashes (except double dash which represents colon)
    while ($sanitized -match '---') {
        $sanitized = $sanitized -replace '---', '--'
    }
    
    # Remove leading/trailing dashes
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
            
            # Check if target already exists
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

# Validate and fix filenames
Write-Host "Validating filenames..." -ForegroundColor Cyan

$renamedCount = 0

# Check Projects folder (PDFs and descriptions)
$projectsDir = Join-Path $FilesDir "Projects"
if (Test-Path $projectsDir) {
    $renamed = Repair-FilenamesInDirectory $projectsDir @('.pdf', '.description')
    $renamedCount += $renamed.Count
}

# Check Blogs folder (Markdown files)
$blogsDir = Join-Path $FilesDir "Blogs"
if (Test-Path $blogsDir) {
    $renamed = Repair-FilenamesInDirectory $blogsDir @('.md', '.description')
    $renamedCount += $renamed.Count
}

# Check Blog-Images folder (All image types)
$blogImagesDir = Join-Path $FilesDir "Blog-Images"
if (Test-Path $blogImagesDir) {
    $renamed = Repair-FilenamesInDirectory $blogImagesDir @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp')
    $renamedCount += $renamed.Count
}

# Check Pictures folder (All image types)
$picturesDir = Join-Path $FilesDir "Pictures"
if (Test-Path $picturesDir) {
    $renamed = Repair-FilenamesInDirectory $picturesDir @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp')
    $renamedCount += $renamed.Count
}

if ($renamedCount -gt 0) {
    Write-Host "[OK] Fixed $renamedCount filename(s)" -ForegroundColor Green
} else {
    Write-Host "[OK] All filenames are valid" -ForegroundColor Green
}
Write-Host ""

# Check for changes
$status = git status --porcelain

if (-not $status) {
    Write-Host "No changes to sync" -ForegroundColor Green
    exit 0
}

# Add, commit, and push
Write-Host "Syncing changes to GitHub..." -ForegroundColor Cyan
Write-Host "Including: Projects, Blogs, Pictures, Blog-Images, and Resume" -ForegroundColor DarkGray

git add chri-portfolio/files/
$commitMessage = "Update content: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage
git push origin $currentBranch

Write-Host "[OK] Synced successfully!" -ForegroundColor Green
