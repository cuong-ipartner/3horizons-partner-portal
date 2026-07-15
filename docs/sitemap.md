# Sitemap — 3HORIZONS Partner Network

**Version:** 1.0  
**Updated:** 2026-07-14  
**Companion:** `docs/information-architecture.md`

---

## 1. Site map (tree)

```text
3HORIZONS Partner Network
│
├── [P] Overview                                          /
│
├── [P] Find by Problem                                   /problems
│   ├── Strategy clarity                                  /problems/strategy-clarity
│   ├── Governance / board                                /problems/governance-board
│   ├── Capability / FMFT                                 /problems/capability-fmft
│   ├── Execution / performance                           /problems/execution-performance
│   ├── AI strategy / governance                          /problems/ai-strategy-governance
│   ├── Succession                                        /problems/succession
│   └── Family governance                                 /problems/family-governance
│
├── [P] Ecosystem Layers                                  /layers
│   ├── T1 Corporate Strategy                             /layers/corporate-strategy
│   ├── T2 Corporate Governance                           /layers/corporate-governance
│   ├── T3 Capability / FMFT                              /layers/capability-fmft
│   ├── T4 Execution / SKALE                              /layers/execution-skale
│   ├── T5 AI Strategy / ISAGC                            /layers/ai-strategy-isagc
│   ├── T6 Business Succession                            /layers/business-succession
│   └── T7 Family Governance                              /layers/family-governance
│
├── [P] Service Lines                                     /services
│   ├── Corporate Strategy Services                       /services/corporate-strategy
│   ├── Governance Services                               /services/governance
│   ├── Capability Building Services                      /services/capability-building
│   ├── Performance Execution Services                    /services/performance-execution
│   ├── AI Strategy Services                              /services/ai-strategy
│   ├── Succession Advisory Services                      /services/succession-advisory
│   └── Family Governance Services                        /services/family-governance
│
├── [P] Partner Directory                                 /partners
│   └── [P] Partner Profile                               /partners/:partnerSlug
│
├── [P/A] Match Request                                   /match
│   └── [A] Confirmation                                  /match/confirmation
│
├── [A] My Requests                                       /me/requests
│   └── [A] Request detail                                /me/requests/:requestId
│
├── [A] My Collaborations                                 /me/collaborations
│   └── [A] Collaboration workspace                       /me/collaborations/:collabId
│
├── [P] Insights / Case Studies                           /insights
│   └── [P] Case study detail                             /insights/:insightSlug
│
├── [P] Join as Partner                                   /join
│   └── [P] Application received                          /join/confirmation
│
└── [P] Utility
    ├── Privacy                                           /privacy
    ├── Terms                                             /terms
    └── Contact                                           /contact
```

**Legend:** `[P]` public · `[A]` authenticated · `[P/A]` public form; account optional for tracking

---

## 2. Route inventory

| # | Route | Page type | Auth | Primary CTA |
|---|-------|-----------|------|-------------|
| 1 | `/` | Overview | No | Find by Problem |
| 2 | `/problems` | Problem index | No | Open problem |
| 3 | `/problems/:problemSlug` | Problem hub | No | Request a Match |
| 4 | `/layers` | Layer index | No | Open layer |
| 5 | `/layers/:layerSlug` | Layer landing | No | Request a Match |
| 6 | `/services` | Service index | No | Open service |
| 7 | `/services/:serviceSlug` | Service landing | No | Request a Match |
| 8 | `/partners` | Directory | No | View profile |
| 9 | `/partners/:partnerSlug` | Profile | No | Request introduction |
| 10 | `/match` | Match wizard | Optional | Submit |
| 11 | `/match/confirmation` | Confirmation | Optional | My Requests |
| 12 | `/me/requests` | Request list | Yes | Open request |
| 13 | `/me/requests/:requestId` | Request detail | Yes | Respond / open collab |
| 14 | `/me/collaborations` | Collab list | Yes | Open workspace |
| 15 | `/me/collaborations/:collabId` | Workspace | Yes | (in-workspace actions) |
| 16 | `/insights` | Insights index | No | Read case |
| 17 | `/insights/:insightSlug` | Case detail | No | Request a Match |
| 18 | `/join` | Partner apply | No | Submit application |
| 19 | `/join/confirmation` | Apply done | No | Back to Overview |
| 20 | `/me/account` | Account | Yes | Save |

**Dynamic page counts (content-driven):**

| Type | Count (v1 taxonomy) |
|------|---------------------|
| Problem hubs | 7 |
| Layer landings | 7 |
| Service landings | 7 |
| Partner profiles | N (content) |
| Insights | N (content) |

---

## 3. Global navigation structure

### Header (desktop)

```text
[Logo: 3HORIZONS Partner Network]
  Overview | Find by Problem | Layers | Services | Partners | Insights
  [Request a Match]  [Join]  [Sign in]
```

### Header (mobile)

```text
[Logo]  [☰]  [Match]
Drawer: same links + My Requests / Collaborations when signed in
```

### Footer

```text
Explore: Problems | Layers | Services | Partners | Insights
For partners: Join as Partner
Trust: How matching works | Privacy | Terms
Contact 3HORIZONS
```

---

## 4. Cross-links (must-have edges)

| From | To |
|------|----|
| Overview problem strip | Each `/problems/:slug` |
| Overview ecosystem map | Each `/layers/:slug` |
| Problem detail | Primary + secondary layers |
| Problem detail | Recommended services |
| Problem detail | Featured partners |
| Layer detail | Related services |
| Layer detail | Featured partners |
| Layer detail | Case examples |
| Service detail | Layers covered |
| Service detail | Recommended partners |
| Partner profile | Layers + services tags |
| Partner profile | Case studies |
| Any discovery page CTA | `/match` with prefill |
| Match confirmation | `/me/requests` |
| Matched request | `/me/collaborations/:id` |
| Directory empty / helper | `/problems` |
| Insights detail | Related problem / layer / match |

---

## 5. Match prefill matrix (query keys)

| Key | Values |
|-----|--------|
| `problem` | problem slug |
| `layer` | layer slug |
| `service` | service slug |
| `partner` | partner slug (optional preference) |
| `source` | `problem` \| `layer` \| `service` \| `profile` \| `directory` \| `insight` |

Example:

```text
/match?problem=ai-strategy-governance&layer=ai-strategy-isagc&service=ai-strategy&source=layer
```

---

## 6. XML-style sitemap (SEO / crawl)

Public routes only; no `/me/*`.

```xml
<!-- Conceptual; implement in app sitemap generator -->
/
/problems
/problems/strategy-clarity
/problems/governance-board
/problems/capability-fmft
/problems/execution-performance
/problems/ai-strategy-governance
/problems/succession
/problems/family-governance
/layers
/layers/corporate-strategy
/layers/corporate-governance
/layers/capability-fmft
/layers/execution-skale
/layers/ai-strategy-isagc
/layers/business-succession
/layers/family-governance
/services
/services/corporate-strategy
/services/governance
/services/capability-building
/services/performance-execution
/services/ai-strategy
/services/succession-advisory
/services/family-governance
/partners
/partners/{slug}
/insights
/insights/{slug}
/join
/match
```

**robots:** Disallow `/me/`, `/match/confirmation` optional.

---

## 7. Breadcrumb patterns

```text
Home > Find by Problem > Succession
Home > Ecosystem Layers > T6 Business Succession
Home > Service Lines > Succession Advisory Services
Home > Partners > {Partner Name}
Home > Insights > {Case Title}
Home > Match Request
Home > My Requests > {Request title}
Home > My Collaborations > {Collab title}
```

---

## 8. Priority for build order (IA → UI)

| Phase | Pages |
|-------|-------|
| P0 | Overview, Problems (index + 7), Match wizard, Confirmation |
| P0 | Layers (index + 7 landings) |
| P1 | Services (index + 7), Partners directory + profile template |
| P1 | My Requests (list + detail) |
| P2 | Insights index + detail, Join as Partner |
| P2 | My Collaborations workspace (minimum viable) |
| P3 | Account, admin review console (ops, may be separate) |

This order protects **problem-first** acceptance criteria before directory polish.
