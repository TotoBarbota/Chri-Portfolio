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
    
    Write-Host "-> Installing $PackageName..." -ForegroundColor Yellow
    try {
        winget install --id $PackageId --silent --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] $PackageName installed successfully" -ForegroundColor Green
            # Refresh PATH environment variable
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            return $true
        } else {
            Write-Host "[X] Failed to install $PackageName" -ForegroundColor Red
            return $false
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "[X] Error installing $PackageName : $errorMsg" -ForegroundColor Red
        return $false
    }
}

# Check if running with administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Get the script's directory (files folder)
$FilesDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Get the repository root (two levels up from files folder)
$RepoRoot = Split-Path -Parent (Split-Path -Parent $FilesDir)

# Change to repository root
Set-Location $RepoRoot
Write-Host "Repository: $RepoRoot" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check if winget is available
$wingetAvailable = Test-CommandExists "winget"
if (-not $wingetAvailable) {
    Write-Host "[!] Warning: winget not found - cannot auto-install missing tools" -ForegroundColor Yellow
    Write-Host "  winget comes with Windows 11 and Windows 10 (with App Installer)" -ForegroundColor DarkGray
    Write-Host ""
}

# Check for Git
$gitInstalled = Test-CommandExists "git"
if (-not $gitInstalled) {
    Write-Host "[X] Git is not installed" -ForegroundColor Red
    
    if ($wingetAvailable) {
        Write-Host ""
        $installGit = Read-Host "Would you like to install Git now? (Y/N)"
        if ($installGit -eq 'Y' -or $installGit -eq 'y') {
            if (-not $isAdmin) {
                Write-Host "[!] Note: Installing without admin rights (user-level install)" -ForegroundColor Yellow
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
                Write-Host "[!] Git installed but not in PATH yet. Please restart your terminal." -ForegroundColor Yellow
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
Write-Host "[OK] Git found: $gitVersion" -ForegroundColor Green

# Check for GitHub CLI
$ghInstalled = Test-CommandExists "gh"
if (-not $ghInstalled) {
    Write-Host "[X] GitHub CLI is not installed" -ForegroundColor Yellow
    
    if ($wingetAvailable) {
        Write-Host ""
        $installGh = Read-Host "Would you like to install GitHub CLI now? (Y/N)"
        if ($installGh -eq 'Y' -or $installGh -eq 'y') {
            if (-not $isAdmin) {
                Write-Host "[!] Note: Installing without admin rights (user-level install)" -ForegroundColor Yellow
            }
            $success = Install-WithWinget "GitHub.cli" "GitHub CLI"
            if (-not $success) {
                Write-Host ""
                Write-Host "Please install GitHub CLI manually from: https://cli.github.com/" -ForegroundColor Yellow
                Write-Host "[!] Warning: Without GitHub CLI, authentication might be more complex" -ForegroundColor Yellow
            } else {
                # Verify installation
                Start-Sleep -Seconds 2
                $ghInstalled = Test-CommandExists "gh"
                if (-not $ghInstalled) {
                    Write-Host "[!] GitHub CLI installed but not in PATH yet. Please restart your terminal." -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "GitHub CLI can make authentication easier: https://cli.github.com/" -ForegroundColor DarkGray
    }
}

if ($ghInstalled) {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Host "[OK] GitHub CLI found: $ghVersion" -ForegroundColor Green
    
    # Check GitHub authentication status
    Write-Host ""
    Write-Host "Checking GitHub authentication..." -ForegroundColor Cyan
    
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Not authenticated with GitHub" -ForegroundColor Yellow
        Write-Host ""
        $authenticate = Read-Host "Would you like to authenticate now? (Y/N)"
        if ($authenticate -eq 'Y' -or $authenticate -eq 'y') {
            Write-Host ""
            Write-Host "Starting GitHub authentication..." -ForegroundColor Cyan
            Write-Host "This will open your browser to complete authentication." -ForegroundColor DarkGray
            Write-Host ""
            
            gh auth login --web --git-protocol https
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Successfully authenticated with GitHub" -ForegroundColor Green
            } else {
                Write-Host "[X] Authentication failed or was cancelled" -ForegroundColor Red
                Write-Host "You can authenticate later by running: gh auth login" -ForegroundColor Yellow
            }
        } else {
            Write-Host "[!] Skipping authentication - push to GitHub may fail" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[OK] Already authenticated with GitHub" -ForegroundColor Green
        # Show account info
        $authStatus | Select-String "Logged in to" | ForEach-Object { 
            Write-Host "  $_" -ForegroundColor DarkGray 
        }
    }
}

Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "[X] Error: Not a git repository" -ForegroundColor Red
    Write-Host "Please run this script from within the repository" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Checking Git configuration..." -ForegroundColor Cyan

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host "[X] Git user information not configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Git needs your identity to create commits." -ForegroundColor White
    Write-Host "This information will be associated with your commits." -ForegroundColor DarkGray
    Write-Host ""
    
    if (-not $gitUserName) {
        Write-Host "Enter your name (e.g., 'John Doe'):" -ForegroundColor Cyan
        Write-Host "This will be visible in commit history" -ForegroundColor DarkGray
        $newUserName = Read-Host "Name"
        
        if ([string]::IsNullOrWhiteSpace($newUserName)) {
            Write-Host ""
            Write-Host "[X] Name cannot be empty" -ForegroundColor Red
            pause
            exit 1
        }
        
        git config user.name "$newUserName"
        Write-Host "[OK] Git username set to: $newUserName" -ForegroundColor Green
        Write-Host ""
    }
    
    if (-not $gitUserEmail) {
        Write-Host "Enter your email (e.g., 'john@example.com'):" -ForegroundColor Cyan
        Write-Host "Use your GitHub email to link commits to your account" -ForegroundColor DarkGray
        $newUserEmail = Read-Host "Email"
        
        if ([string]::IsNullOrWhiteSpace($newUserEmail)) {
            Write-Host ""
            Write-Host "[X] Email cannot be empty" -ForegroundColor Red
            pause
            exit 1
        }
        
        git config user.email "$newUserEmail"
        Write-Host "[OK] Git email set to: $newUserEmail" -ForegroundColor Green
        Write-Host ""
    }
    
    Write-Host "-------------------------------------------" -ForegroundColor DarkGray
    Write-Host "Git configuration saved!" -ForegroundColor Green
    Write-Host "Future commits will use: $newUserName <$newUserEmail>" -ForegroundColor White
    Write-Host "-------------------------------------------" -ForegroundColor DarkGray
} else {
    Write-Host "[OK] Git configured as: $gitUserName <$gitUserEmail>" -ForegroundColor Green
}

Write-Host ""

# Get current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Ask which branch to sync to
Write-Host "Which branch do you want to sync to?" -ForegroundColor Cyan
Write-Host "  1. Current branch ($currentBranch)" -ForegroundColor White
Write-Host "  2. main" -ForegroundColor White
Write-Host "  3. Feature-local" -ForegroundColor White
Write-Host "  4. Custom branch name" -ForegroundColor White
Write-Host ""
$branchChoice = Read-Host "Enter choice (1-4, or press Enter for current)"

if ([string]::IsNullOrWhiteSpace($branchChoice) -or $branchChoice -eq '1') {
    $targetBranch = $currentBranch
} elseif ($branchChoice -eq '2') {
    $targetBranch = 'main'
} elseif ($branchChoice -eq '3') {
    $targetBranch = 'Feature-local'
} elseif ($branchChoice -eq '4') {
    Write-Host ""
    $customBranch = Read-Host "Enter branch name"
    if ([string]::IsNullOrWhiteSpace($customBranch)) {
        Write-Host "[X] Branch name cannot be empty" -ForegroundColor Red
        pause
        exit 1
    }
    $targetBranch = $customBranch
} else {
    Write-Host "[!] Invalid choice, using current branch" -ForegroundColor Yellow
    $targetBranch = $currentBranch
}

Write-Host ""
Write-Host "Target branch: $targetBranch" -ForegroundColor Green

Write-Host ""
Write-Host "Checking remote repository..." -ForegroundColor Cyan

# Fetch latest changes from remote
git fetch origin --quiet

# Switch to target branch if different from current
if ($targetBranch -ne $currentBranch) {
    Write-Host "Switching to branch: $targetBranch" -ForegroundColor Yellow
    git checkout $targetBranch 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Error: Branch '$targetBranch' does not exist" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available branches:" -ForegroundColor Yellow
        git branch -a
        Write-Host ""
        pause
        exit 1
    }
    Write-Host "[OK] Switched to $targetBranch" -ForegroundColor Green
    Write-Host ""
}

# Check if local is behind remote
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/$targetBranch 2>$null

if ($remoteCommit -and $localCommit -ne $remoteCommit) {
    # Check if we can fast-forward
    $mergeBase = git merge-base HEAD origin/$targetBranch
    
    if ($mergeBase -eq $localCommit) {
        # Local is behind, can fast-forward
        Write-Host "" 
        Write-Host "[!] Your local repository is behind the remote" -ForegroundColor Yellow
        Write-Host ""
        $pull = Read-Host "Pull latest changes before syncing? (Y/N)"
        if ($pull -eq 'Y' -or $pull -eq 'y') {
            Write-Host ""
            Write-Host "-> Pulling latest changes..." -ForegroundColor White
            git pull origin $targetBranch --ff-only
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Updated to latest version" -ForegroundColor Green
            } else {
                Write-Host "[X] Error pulling changes" -ForegroundColor Red
                pause
                exit 1
            }
        } else {
            Write-Host "[!] Warning: Proceeding without pulling may cause push to fail" -ForegroundColor Yellow
        }
    }
    elseif ($mergeBase -ne $remoteCommit) {
        # Branches have diverged
        Write-Host "" 
        Write-Host "[X] Error: Local and remote branches have diverged" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means you have local commits that conflict with remote commits." -ForegroundColor Yellow
        Write-Host "You need to resolve this manually:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Option 1 - Merge remote changes:" -ForegroundColor Cyan
        Write-Host "    git pull origin $targetBranch" -ForegroundColor White
        Write-Host ""
        Write-Host "  Option 2 - Rebase your changes:" -ForegroundColor Cyan
        Write-Host "    git pull --rebase origin $targetBranch" -ForegroundColor White
        Write-Host ""
        pause
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

Write-Host ""
Write-Host "Validating filenames..." -ForegroundColor Cyan
Write-Host ""

$renamedCount = 0

# Check Projects folder (PDFs and descriptions)
$projectsDir = Join-Path $FilesDir "Projects"
if (Test-Path $projectsDir) {
    $renamed = Repair-FilenamesInDirectory $projectsDir @('.pdf', '.description')
    $renamedCount += $renamed.Count
}

# Check Blogs folder (Markdown files and descriptions)
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
Write-Host "---------------------------------" -ForegroundColor DarkGray
git status --short
Write-Host "---------------------------------" -ForegroundColor DarkGray
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
Write-Host "Including: Projects, Blogs, Pictures, Blog-Images, and Resume" -ForegroundColor DarkGray
Write-Host ""

# Check if resume.pdf exists and warn if not
$resumePath = Join-Path $FilesDir "resume.pdf"
if (-not (Test-Path $resumePath)) {
    Write-Host "[!] Warning: resume.pdf not found in files directory" -ForegroundColor Yellow
    Write-Host "  Resume downloads will not work until you add resume.pdf" -ForegroundColor DarkGray
    Write-Host ""
}

# Add all changes in the files directory
Write-Host "-> Adding changes..." -ForegroundColor White
git add chri-portfolio/files/

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
Write-Host "---------------------------------" -ForegroundColor DarkGray
$stagedChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
Write-Host "---------------------------------" -ForegroundColor DarkGray
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
try {
    git commit -m $commitMessage
    Write-Host "[OK] Changes committed successfully" -ForegroundColor Green
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "[X] Error committing changes : $errorMsg" -ForegroundColor Red
    pause
    exit 1
}

# Push to remote
Write-Host ""
Write-Host "Pushing to branch: $targetBranch" -ForegroundColor Yellow
Write-Host ""
Write-Host "-> Pushing to GitHub..." -ForegroundColor White
try {
    git push origin $targetBranch
    Write-Host "[OK] Changes pushed to GitHub successfully!" -ForegroundColor Green
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "[X] Error pushing to GitHub : $errorMsg" -ForegroundColor Red
    Write-Host ""
    Write-Host "This might happen if:" -ForegroundColor Yellow
    Write-Host "  1. You're not authenticated with GitHub" -ForegroundColor Yellow
    Write-Host "  2. You don't have push permissions" -ForegroundColor Yellow
    Write-Host "  3. There are conflicts with remote changes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try running: git push origin $targetBranch" -ForegroundColor Cyan
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
Write-Host "  [OK] Pushed to GitHub ($targetBranch)" -ForegroundColor Green
Write-Host ""
Write-Host "Your content is now synced!" -ForegroundColor Green
Write-Host ""

pause

