# Local development

Please follow these steps in order to setup your local environment.

## Create a Github token

On your Github profile, select `Settings` &#8594; `Developer settings` &#8594; `Personal access tokens` &#8594; `Tokens (classic)`.

Generate a new token that has `repo` and `project` permissions.

## Create a `.env.local` file

Within the current directory, create a `.env.local` file and paste the following:

```
MOSAIC_ACTIVE_MODE_URL=http://localhost:8080
MOSAIC_DOCS_CLONE_CREDENTIALS=[your_github_username:your_token]
MOSAIC_SNAPSHOT_DIR=snapshots/latest
OPTIMIZE_IMAGES=false
SNAPSHOT_MODE=active
```

## Run the local server

Run the following command and navigate to `http://localhost:3000/salt/index`.

```
yarn serve
```
