# User flows — 3HORIZONS Partner Network

**Version:** 1.0  
**Updated:** 2026-07-14

---

## Flow A — Problem-first match (primary)

```mermaid
flowchart TD
  A[Land Overview] --> B[Find by Problem]
  B --> C[Select problem hub]
  C --> D[View primary + related layers]
  D --> E[View recommended service lines]
  E --> F[Review featured partners]
  F --> G[Request a Match]
  G --> H[Wizard: problem prefilled]
  H --> I[Confirm layer + service]
  I --> J[Optional partner preference]
  J --> K[Submit request]
  K --> L[3HORIZONS review]
  L --> M{Decision}
  M -->|needs info| N[User updates]
  N --> L
  M -->|matched| O[Collaboration workspace]
  M -->|closed| P[Archive]
```

**Acceptance:** User never needs to open Directory to complete a quality match.

---

## Flow B — Layer explorer

```mermaid
flowchart TD
  A[Ecosystem Layers map] --> B[Open layer landing T1-T7]
  B --> C[What it solves + deliverables]
  C --> D[Related services + featured partners]
  D --> E[Request a Match with layer prefill]
```

---

## Flow C — Service-led

```mermaid
flowchart TD
  A[Service Lines index] --> B[Service landing]
  B --> C[Problem + layers + partner type]
  C --> D[Recommended partners]
  D --> E[Request a Match with service prefill]
```

---

## Flow D — Directory / known partner (secondary)

```mermaid
flowchart TD
  A[Partner Directory] --> B[Apply filters]
  B --> C[Open profile]
  C --> D[Request introduction]
  D --> E[Match wizard partner preference set]
  E --> F[3HORIZONS review]
  F --> G[Collaboration if confirmed]
```

**Guardrail:** Profile CTA is “Request introduction”, not “Book / Hire now”.

---

## Flow E — Insights as trust entry

```mermaid
flowchart TD
  A[Insights index] --> B[Case study]
  B --> C[Mapped problem / layer / partners]
  C --> D[Request a Match]
```

---

## Flow F — Join as partner (supply)

```mermaid
flowchart TD
  A[Join as Partner] --> B[Fit criteria]
  B --> C[Application form]
  C --> D[3HORIZONS review]
  D --> E{Approved?}
  E -->|yes| F[Profile drafted / verified]
  E -->|no| G[Closed or waitlist]
```

---

## Match status machine

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> submitted
  submitted --> in_review
  in_review --> needs_info
  needs_info --> in_review
  in_review --> matched
  in_review --> closed
  matched --> collaboration_active
  collaboration_active --> closed
  draft --> closed
```
