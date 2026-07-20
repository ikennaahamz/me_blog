# Domain Docs

How engineering skills consume this repository’s domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repository root
- Relevant ADRs under `docs/adr/`

If these files do not exist, proceed silently. Domain-modeling skills create them
when terminology or architectural decisions are resolved.

## Layout

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Vocabulary

Use domain terms as defined in `CONTEXT.md`. Avoid synonyms that its glossary
explicitly rejects. If a needed concept is absent, reconsider the terminology or
note the gap for domain modeling.

## ADR conflicts

Explicitly flag any proposal that contradicts an existing ADR rather than silently
overriding the decision.
