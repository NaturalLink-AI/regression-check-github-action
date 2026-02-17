# NaturalLink Regression Check - Github Action

A GitHub Action by [NaturalLink](https://naturallink.ai) that runs UI and User
Flows regression checks on your pull requests and posts the results in the PR as
a comment.

## Prerequisites

Before using this action, you'll need to complete the following steps:

### 1. Request Access on Natural Link

Request Access at [naturallink.ai](https://naturallink.ai) to get started.

### 2. Obtain an API Key

Once signed up, obtain an API key from the
[Dashboard](https://dashboard.naturallink.ai). This key allows the action to
communicate with our servers.

### 3. Store the API key as a GitHub Secret

Add your NaturalLink API key as a secret in your GitHub repository (or
organization):

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set the name to `NATURALLINK_API_KEY`
5. Paste your API key as the value
6. Click **Add secret**

> For organization-wide usage, you can add the secret at the organization level
> under **Organization Settings** → **Secrets and variables** → **Actions**.

## Usage

Add the following workflow file to your repository at
`.github/workflows/regression-check.yml`:

```yaml
name: NaturalLink Regression Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  regression-check:
    name: Regression Check
    runs-on: ubuntu-latest

      - name: Run NaturalLink Regression Check
        id: regression-check
        uses: NaturalLink-AI/regression-check-github-action@v1
        with:
          api-key: ${{ secrets.NATURALLINK_API_KEY }}
```

