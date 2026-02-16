# Regression Check - Github Action

A GitHub Action by [Natural Link](https://naturallink.ai) that runs regression checks on your pull requests and posts the results directly as a PR comment.

## Prerequisites

Before using this action, you'll need to complete the following steps:

### 1. Sign up on Natural Link

Create an account at [naturallink.ai](https://naturallink.ai) to get started.

### 2. Obtain an API Token

Once signed up, obtain an API token from Natural Link. This token allows the action to communicate with the Natural Link.

### 3. Store the API Token as a GitHub Secret

Add your Natural Link API token as a secret in your GitHub repository (or organization):

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set the name to `NATURALLINK_API_TOKEN`
5. Paste your API token as the value
6. Click **Add secret**

> For organization-wide usage, you can add the secret at the organization level under **Organization Settings** → **Secrets and variables** → **Actions**.

## Usage

Add the following workflow file to your repository at `.github/workflows/regression-check.yml`:

```yaml
name: Regression Check

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write
  issues: write

jobs:
  regression-check:
    name: Regression Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Run Natural Link Regression Check
        id: regression-check
        uses: NaturalLink-AI/regression-check-github-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          naturallink-api-token: ${{ secrets.NATURALLINK_API_TOKEN }}
```

## Support

For questions, issues, or feedback, reach out to us:

- **Website**: [Natural Link](https://naturallink.ai)
