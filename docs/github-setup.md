# See AGENTS.md — one-time GitHub repo settings for agentic CI/CD

## Branch protection (main)

Settings → Branches → Add rule for `main`:

- [x] Require a pull request before merging
- [x] Require status checks to pass:
  - `lint-test-build`
  - `secret-scan`
  - `policy-check` (PRs only — optional on direct push if disabled)
- [x] Require branches to be up to date before merging
- [ ] Do not allow bypassing (recommended once CI is stable)

## Auto-merge

Settings → General → Pull Requests:

- [x] **Allow auto-merge**
- [x] **Automatically delete head branches** (optional)

Auto-merge is enabled by [`.github/workflows/auto-merge.yml`](../workflows/auto-merge.yml) for PRs labeled `agent-pr` or branches `cursor/*`.

## Semi-auto trial (recommended)

For the first **2 weeks**, disable auto-merge workflow or merge PRs manually while CI runs. Then enable full auto per [AGENTS.md](../../AGENTS.md).

To disable temporarily: disable the **Auto merge** workflow in Actions tab.

## Notifications (cheap tier observability)

- Watch repo → **All Activity** or Custom → Actions failures
- GitHub email notifications on failed workflows
- Deploy verify opens an `incident` issue on failure

## Dependabot

Configured in [dependabot.yml](../dependabot.yml). Label Dependabot PRs with `agent-pr` for auto-merge after CI passes (patch/minor only).

## CODEOWNERS

Requires GitHub **Pro** or public repo for automatic review requests. On free private repos, CODEOWNERS still documents ownership; enforce via CI policy-check instead.
