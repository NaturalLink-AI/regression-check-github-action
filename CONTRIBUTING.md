# Contributing to NaturalLink Regression Check

Thank you for your interest in contributing to the NaturalLink Regression Check
GitHub Action! We welcome contributions from the community.

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 9.x or later

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/regression-check-github-action.git
   cd regression-check-github-action
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Code Style

This project uses Prettier for formatting and ESLint for linting. Before
committing, ensure your code passes all checks:

```bash
npm run format:write  # Format code
npm run lint          # Check for linting errors
```

### Testing

All changes should include tests. Run the test suite with:

```bash
npm run test          # Run tests
npm run ci-test       # Run tests with coverage
```

We aim for 100% test coverage. Check coverage with:

```bash
npm run ci-test -- --coverage
```

### Building

After making changes to the source code, rebuild the action:

```bash
npm run bundle
```

This will:

1. Format the code
2. Build the TypeScript to JavaScript
3. Bundle everything into `dist/index.js`

### Full Verification

Before submitting a PR, run the full verification suite:

```bash
npm run all
```

This runs format, lint, test, coverage, and package commands.

## Pull Request Guidelines

### Before Submitting

- [ ] All tests pass (`npm run test`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Coverage is maintained or improved
- [ ] `dist/` directory is updated (`npm run bundle`)
- [ ] Documentation is updated if needed

### PR Title

Use conventional commit format for PR titles:

- `feat: Add new feature`
- `fix: Fix bug in X`
- `docs: Update documentation`
- `chore: Update dependencies`
- `test: Add tests for X`

### PR Description

Include:

- A summary of the changes
- Any breaking changes
- Related issues (use "Fixes #123" to auto-close)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to
providing a welcoming and inclusive environment for everyone.

## Questions?

If you have questions, feel free to:

- Open a
  [GitHub Issue](https://github.com/NaturalLink-AI/regression-check-github-action/issues)
- Email us at contact@naturallink.ai

Thank you for contributing!
