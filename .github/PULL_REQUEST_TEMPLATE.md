## Summary

<!-- Briefly describe what this PR does -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to
      change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] CI/CD or tooling changes

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
for automated releases.

**Commits that trigger a release:** | Prefix | Release Type | Example |
|--------|--------------|---------| | `feat:` | Minor version bump |
`feat: add support for custom API endpoints` | | `fix:` | Patch version bump |
`fix: handle null response from API` | | `feat!:` or `fix!:` | Major version
bump | `feat!: change output format to JSON` |

**Commits that do NOT trigger a release:** | Prefix | Example |
|--------|---------| | `chore:` | `chore: update dependencies` | | `docs:` |
`docs: add usage examples to README` | | `refactor:` |
`refactor: extract API client to separate module` | | `test:` |
`test: add coverage for error handling` | | `ci:` |
`ci: add Node 22 to test matrix` |

**With ticket/scope:**

- `feat(api): add retry logic` — scope in parentheses
- `feat(PROJ-123): add retry logic` — ticket as scope
- `fix(PROJ-456)!: change auth flow` — ticket + breaking change

> Ensure your PR title follows this convention as it becomes the merge commit
> message.

## Related Issues

<!-- Link to related issues: Fixes #123, Relates to #456 -->

## Changes Made

<!-- List the specific changes made in this PR -->

-
-
-

## Testing

<!-- Describe how you tested your changes -->

- [ ] I have run `npm run all` and all checks pass
- [ ] I have added/updated tests that prove my fix/feature works
- [ ] Coverage is maintained or improved

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary (explaining _why_, not _what_)
- [ ] I have updated the documentation if needed
- [ ] My changes generate no new warnings
- [ ] The `dist/` directory is up to date (`npm run bundle`)

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Additional Notes

<!-- Any additional information reviewers should know -->
