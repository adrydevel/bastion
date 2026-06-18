# Contributing

Thanks for your interest in Bastion.

## Setup

```bash
npm install
npm run typecheck
npm test
```

## Guidelines

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:` …).
- Keep the risk kernel and proof paths deterministic — no hidden randomness.
- New agents implement the `Agent` interface and stay side-effect free.
- Open an issue before large changes so we can align on direction.
