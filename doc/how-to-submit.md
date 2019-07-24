# How to submit

> Step by step process to submit your [js13kgames.com/](https://js13kgames.com/) entry.

## Table of Content

- [TL;DR](#TL;DR)
- [Step by step](#step-by-step)
  - [Fork](#fork)
  - [Pull Request](#pull-request)
  - [Release](#release)
- [FAQ](#FAQ)

## TL;DR

- fork [github.com/Platane/js13-entry](https://github.com/Platane/js13-entry)
- work on your entry 👷
- create a PR
- create a release with a zip file containing your game
- 🍹

## Step by step

### Fork

[...]

### Pull Request

[...]

### Release

[...]

## FAQ

### Can I see a fully featured exemple ?

[sure ](.)

### I already made a repository, and I don't want to lose my history

It's ok, we just need to change the git remote.

- fork [github.com/Platane/js13-entry](https://github.com/Platane/js13-entry)

- get the remote url (you can found it under the "clone or download" button, and it looks like `git@github.com:<github_login>/js13-entry.git` )

- in a term

```bash

# change the origin url to the fork
# replace git@github.com:<github_login>/js13-entry.git by your remote url
git remote set-url origin git@github.com:<github_login>/js13-entry.git

# fetch the latest commit on the fork
# it should contain only a dummy commit
git fetch

# rebase your commit history on top of the ones from entry
# which should be easy since origin only have one dummy commit
git rebase origin/master

# push your history
git push
```

### I already made a repository, and I want to keep committing on it

Ok, so instead of changing the remote url, we can add a new one.

```bash

# add a new remote, named "entry"
# replace git@github.com:<github_login>/js13-entry.git by your remote url
git remote add entry git@github.com:<github_login>/js13-entry.git

# get the latest commit from entry
git fetch entry

# rebase your commit history on top of the ones from entry
git rebase entry/master

# push to entry
git push --set-upstream entry master
```

whenever you want to push commits to the fork, do `git push entry`

### I want to submit more than one entry

One workaround is to create one branch for each of your entry.

Have the PR target your branch, as well as your release
