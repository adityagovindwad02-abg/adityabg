#!/bin/bash
set -e

GIT_EXEC_PATH="/Users/cine_stories/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/libexec/git-core"
export GIT_EXEC_PATH
export PATH="/Users/cine_stories/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/bin:$PATH"

echo "=== Aditya Govindwad Portfolio GitHub Pusher ==="
echo "Target: https://github.com/adityagovindwad02-abg/adityabg.git"

if [ -n "$1" ]; then
    echo "Pushing using provided token..."
    git push "https://$1@github.com/adityagovindwad02-abg/adityabg.git" main
else
    git push -u origin main
fi
