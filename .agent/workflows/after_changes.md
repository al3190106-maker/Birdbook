---
description: Push all local changes to GitHub after any code edits
---

After making ANY changes to the codebase (editing, creating, or deleting files), ALWAYS run the following steps to push the code to GitHub. Do this automatically at the end of every conversation where files were changed, without needing to be asked.

// turbo-all
1. Add all changes to git staging:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); git add .
```

2. Check what changed:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); git status --short
```

3. Commit and push (write a meaningful commit message describing what changed):
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); git commit -m "YOUR_COMMIT_MESSAGE_HERE"; git push
```

The site will be live at https://al3190106-maker.github.io/Birdbook/ within ~1 minute of pushing.

> Note: If `git status` shows "nothing to commit, working tree clean", there is nothing to push.
