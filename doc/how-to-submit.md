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

- fork [github.com/js13kGames/entry](https://github.com/js13kGames/entry)
- work on your entry 👷
- create a PR
- create a release with a zip file containing your game
- 🍹

## Step by step

### Fork

For the repository [github.com/js13kGames/entry](https://github.com/js13kGames/entry)

> If you have troubles forking, please read this [github guide](https://help.github.com/en/articles/fork-a-repo)

### Pull Request

Once your submission is ready, open a pull request.

In addition to your games sources, the pull request should includes. A manifest containing information about your game, as well as some images.

It should includes: 
- a large image, with a 300:200 ratio
- a thumbnail image, with a 100:100 ratio

The images can actually be larger as long as the ratio is the same.

The manifest should be a json file looking like:
```javascript
{
  "name": "my game",
  "description": "This game is **fantastic**.\n 👍",
  "images" : {
    "image_large": "path/to/image_large.png",
    "image_thumbnail": "path/to/image_thumbnail.png",
  }
}
```

If the `images` property is not defined, it will default to look for images named `image_large` and `image_thumbnail`

### Release

Your bundled entry does not need to be committed, instead it should be upload as release asset.

You bundle should be zipped and contain a file named `index.html`.

The release tagname does not matter.

> If you have troubles creating the relese, please read this [github guide](https://help.github.com/en/articles/creating-releases)


## FAQ

### Can I see a fully featured exemple ?

[sure ](https://github.com/js13kGames/entry/pull/13)

### I already made a repository, and I don't want to lose my history

It's ok, we just need to change the git remote.

1. Fork [github.com/js13kGames/entry](https://github.com/js13kGames/entry)

2. Get the fork remote url (you can found it under the "clone or download" button, and it looks like `git@github.com:<github_login>/js13-entry.git` )

3. In your initial repository, change the remote url

  ```bash
  # replace git@github.com:<github_login>/js13-entry.git by your remote url
  git remote set-url origin git@github.com:<github_login>/js13-entry.git
```

4. Fetch the commits from the fork. _(it should contain only a dummy commit)_

  ```bash
  git fetch
  ```

5. Rebase your commit history on top of the ones from the fork _(which should be easy since it only have one dummy commit)_

  ```bash
  git rebase origin/master
  ```

6. Push your history

  ```bash
  git push
  ```

### I already made a repository, and I want to keep committing on it

Ok, so instead of changing the remote url, we can add a new one.

1. Fork

2. Get the fork remote url

3. Add a new remote to your initial repository, named "entry"

  ```bash
  # replace git@github.com:<github_login>/js13-entry.git by your remote url
  git remote add entry git@github.com:<github_login>/js13-entry.git
```

4. Fetch the commits from the fork. _(it should contain only a dummy commit)_

  ```bash
  git fetch entry
  ```

5. Rebase your commit history on top of the ones from the fork _(which should be easy since it only have one dummy commit)_

  ```bash
  git rebase entry/master
  ```

6. Push your history to entry

  ```bash
  git push --set-upstream entry master
  ```

7. Push your rebased history to origin

  ```bash
  git push origin --force
  ```

8. Whenever you want to push commits to the fork, push to the entry remote

  ```bash
  git push entry
  ```

### I want to submit more than one entry

One workaround is to create one branch for each of your entry.

Have the PR target your branch, as well as your release


### I am still lost

Don't hesitate to ask for help on [js13kGames.slack.com](http://js13kGames.slack.com)