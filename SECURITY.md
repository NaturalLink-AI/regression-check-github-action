# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing
**security@naturallink.ai**.

Please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Resolution**: We aim to resolve critical issues within 7 days
- **Disclosure**: We will coordinate disclosure with you

## Security Best Practices

When using this action:

1. **Never commit API keys** - Always use GitHub Secrets
2. **Use specific versions** - Pin to a specific version (e.g., `@v0.3.0`)
   rather than `@main`
3. **Review permissions** - This action only requires `contents: read` and
   `pull-requests: read` permissions
4. **Rotate keys regularly** - Rotate your NaturalLink API key periodically

## Security Measures

This action implements several security measures:

- **No secrets in logs** - API keys are never logged
- **Minimal permissions** - Only requests necessary permissions
- **Dependency scanning** - Dependencies are scanned with CodeQL and Dependabot
- **Signed releases** - All releases are signed

## Dependencies

We use Dependabot to keep dependencies up to date and scan for known
vulnerabilities. Security updates are prioritized and released promptly.
