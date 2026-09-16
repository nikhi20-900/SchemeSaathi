# SchemeSaathi – AI Government Scheme Navigator

Hackathon MVP: help students discover, understand, and verify eligibility for government education schemes with grounded AI, a deterministic rules engine, and document verification.

**Repository:** https://github.com/nikhi20-900/SchemeSaathi  
**Project board:** see the **SchemeSaathi – Hackathon** GitHub Project on this account.

## Team (4 subsystems)

| Role | Branch | Placeholder GitHub username |
| --- | --- | --- |
| AI / RAG Engineer | `feature/ai-rag` | `YOUR_USERNAME_1` |
| Eligibility / Rules Engine Engineer | `feature/eligibility-engine` | `YOUR_USERNAME_2` |
| OCR / Document Intelligence Engineer | `feature/ocr-documents` | `YOUR_USERNAME_3` |
| Frontend / Integration Engineer | `feature/frontend` | `YOUR_USERNAME_4` |

Replace the placeholder usernames with real GitHub handles, then assign the matching issue.

## Development dependency (MVP)

All four issues are **priority-high**. Work in parallel with mocks where needed.

```text
Member 1
RAG + Scheme Data
      │
      ├──────────────┐
      ▼              ▼
Member 2          Member 3
Eligibility       OCR
      │              │
      └──────┬───────┘
             ▼
          Member 4
       Frontend Integration
```

## Git workflow

Never commit directly to `main`. Each issue ships as a pull request from its feature branch.

PR title format:

```text
feat: implement [component]
```

Each PR must include:

- What was implemented
- Screenshots if UI-related
- API examples if backend-related
- Tests
- Known limitations
- Related GitHub issue

## Definition of Done

An issue is **Done** only when:

- Code is implemented
- Tests pass
- Documentation is updated
- No secrets/API keys are committed
- Code is pushed to the correct branch
- Pull Request is created
- PR is reviewed
- PR is merged into `main`
- GitHub issue is closed

Do not close issues merely because coding has started.
