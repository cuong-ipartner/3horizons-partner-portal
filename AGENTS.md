# Client project: 3HORIZONS Partner Network

## Business

- **Slug:** `3horizons-partner-portal`
- **Industry:** Management consulting / partner ecosystem / family business & governance
- **Package:** POC
- **Sponsor:** 3HORIZONS
- **Success metric:** Users enter by **problem**, complete a governed **match request**, without treating the site as a random partner marketplace
- **Demo date:** TBD

## Scope

### In scope (IA complete)

- Problem-first information architecture and sitemap
- Ecosystem layers T1–T7 with dedicated landings (spec)
- Service lines with dedicated landings (spec)
- Partner directory filters + deep profile model (spec)
- Match workflow: problem → layer → service → partners → request → review → collaboration (spec)

### In scope (build — next)

- UI vertical slice for Overview + Find by Problem + Match
- Layer and service landing templates
- Partner directory + profile templates
- Authenticated My Requests / My Collaborations (MVP)

### Out of scope (until SOW expands)

- Self-serve hire / payments bypassing 3HORIZONS
- Full project OS inside collaboration workspace
- Public marketplace ratings clutter
- Aria/LLM chat (optional later assist layer)

## Product principle

**Problem-first, not directory-first.**  
Directory is secondary. Match is governed by 3HORIZONS.

## Tech

- **Stack:** TBD (bias: TypeScript web app + auth + CMS/seed content)
- **Deploy:** TBD (Docker on Ubuntu VPS or client host)
- **Data class:** internal / confidential (partner briefs, client context)
- **Language UI:** en primary for premium B2B network; vi support via language filter / future i18n

## Conventions

- Client docs: Vietnamese when client-facing; IA/source docs may be English
- Code: English
- Do not commit secrets
- Prefer vertical slice over wide scaffolding
- Visual: premium strategic B2B, 3HORIZONS brand language, no marketplace clutter

## Key docs

| Doc | Path |
|-----|------|
| Information architecture | `docs/information-architecture.md` |
| Sitemap | `docs/sitemap.md` |
| Taxonomy | `docs/taxonomy.md` |
| User flows | `docs/user-flows.md` |
| Status | `docs/status.md` |

## Contacts

- Client technical: TBD
- Your channel: TBD
