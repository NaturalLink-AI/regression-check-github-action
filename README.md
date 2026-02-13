# Natural Link Regression Check — GitHub Action

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

## Support

For questions, issues, or feedback, reach out to us:

- **Email**: [sachin@naturallink.ai](mailto:sachin@naturallink.ai)
