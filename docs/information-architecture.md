# Information Architecture — 3HORIZONS Partner Network

**Version:** 1.0  
**Updated:** 2026-07-14  
**Principle:** Problem-first, not directory-first.

---

## 1. Product intent

The Partner Network is a **strategic ecosystem navigator**, not a marketplace catalog.

Users should:

1. Start from a **business problem**
2. Be routed to the right **ecosystem layer(s)**
3. See the right **service line(s)**
4. Discover **best-fit partners**
5. Submit a **match request**
6. Move into a **private collaboration workspace** after 3HORIZONS review

Every page must answer:

- Why am I here?
- What is the next clear action?

---

## 2. Core principle (enforced)

| Anti-pattern (avoid) | Desired pattern |
|----------------------|-----------------|
| Browse random profiles first | Select problem → guided path |
| Flat partner dump | Layered ecosystem with trust signals |
| “Shop all services” clutter | Curated routing + recommended matches |
| Self-serve hire without oversight | Match request → 3HORIZONS review → collaboration |

**Default entry:** Overview + **Find by Problem**.  
Partner Directory remains available but is **secondary** to problem-led journeys.

---

## 3. Top-level sitemap

```text
Partner Network
├── Overview                         /
├── Find by Problem                  /problems
│   └── [Problem hub pages]          /problems/:problemSlug
├── Ecosystem Layers                 /layers
│   └── [T1–T7 layer pages]          /layers/:layerSlug
├── Service Lines                    /services
│   └── [Service line pages]         /services/:serviceSlug
├── Partner Directory                /partners
├── Partner Profiles                 /partners/:partnerSlug
├── Match Request                    /match
│   └── Request confirmation         /match/confirmation
├── My Requests                      /me/requests
│   └── Request detail               /me/requests/:id
├── My Collaborations                /me/collaborations
│   └── Collaboration workspace      /me/collaborations/:id
├── Insights / Case Studies          /insights
│   └── Case study detail            /insights/:slug
└── Join as Partner                  /join
```

### Primary navigation (public)

| Order | Label | Route | Role |
|------:|-------|-------|------|
| 1 | Overview | `/` | Frame the ecosystem |
| 2 | Find by Problem | `/problems` | **Primary entry** |
| 3 | Ecosystem Layers | `/layers` | Strategic map |
| 4 | Service Lines | `/services` | Offer framing |
| 5 | Partners | `/partners` | Directory (secondary) |
| 6 | Insights | `/insights` | Proof / trust |
| 7 | Join as Partner | `/join` | Supply-side CTA |

### Authenticated utility nav

| Label | Route |
|-------|-------|
| My Requests | `/me/requests` |
| My Collaborations | `/me/collaborations` |
| Account | `/me/account` |

### Persistent CTAs

- Header secondary: **Request a Match** → `/match`
- Footer: Join as Partner, Contact 3HORIZONS, Privacy

---

## 4. Taxonomy

### 4.1 Ecosystem layers (T1–T7)

| Code | Name | Slug | Short label |
|------|------|------|-------------|
| T1 | Corporate Strategy | `corporate-strategy` | Strategy |
| T2 | Corporate Governance | `corporate-governance` | Governance |
| T3 | Capability / FMFT | `capability-fmft` | Capability |
| T4 | Execution / SKALE | `execution-skale` | Execution |
| T5 | AI Strategy / ISAGC | `ai-strategy-isagc` | AI Strategy |
| T6 | Business Succession | `business-succession` | Succession |
| T7 | Family Governance | `family-governance` | Family Governance |

### 4.2 Find by Problem (entry hubs)

| Problem | Slug | Primary layer(s) | Secondary layer(s) |
|---------|------|------------------|--------------------|
| Strategy clarity | `strategy-clarity` | T1 | T3, T4 |
| Governance / board | `governance-board` | T2 | T1, T7 |
| Capability / FMFT | `capability-fmft` | T3 | T1, T4 |
| Execution / performance | `execution-performance` | T4 | T1, T3 |
| AI strategy / governance | `ai-strategy-governance` | T5 | T1, T2 |
| Succession | `succession` | T6 | T2, T7 |
| Family governance | `family-governance` | T7 | T2, T6 |

### 4.3 Service lines

| Service line | Slug | Primary problem(s) | Layers covered |
|--------------|------|--------------------|----------------|
| Corporate Strategy Services | `corporate-strategy` | Strategy clarity | T1 (lead), T3, T4 |
| Governance Services | `governance` | Governance / board | T2 (lead), T1, T7 |
| Capability Building Services | `capability-building` | Capability / FMFT | T3 (lead), T1, T4 |
| Performance Execution Services | `performance-execution` | Execution / performance | T4 (lead), T1, T3 |
| AI Strategy Services | `ai-strategy` | AI strategy / governance | T5 (lead), T1, T2 |
| Succession Advisory Services | `succession-advisory` | Succession | T6 (lead), T2, T7 |
| Family Governance Services | `family-governance` | Family governance | T7 (lead), T2, T6 |

### 4.4 Crosswalk matrix (problem → layer → service)

| Problem | → Layers | → Service line(s) |
|---------|----------|-------------------|
| Strategy clarity | T1 → T3 → T4 | Corporate Strategy; Capability Building; Performance Execution |
| Governance / board | T2 → T1 → T7 | Governance; Corporate Strategy; Family Governance |
| Capability / FMFT | T3 → T1 → T4 | Capability Building; Corporate Strategy; Performance Execution |
| Execution / performance | T4 → T1 → T3 | Performance Execution; Corporate Strategy; Capability Building |
| AI strategy / governance | T5 → T1 → T2 | AI Strategy; Corporate Strategy; Governance |
| Succession | T6 → T2 → T7 | Succession Advisory; Governance; Family Governance |
| Family governance | T7 → T2 → T6 | Family Governance; Governance; Succession Advisory |

**Routing rule:**  
Problem page always surfaces **primary layer first**, then related layers as optional deepen paths. Match Request pre-fills problem + primary layer + recommended service line.

---

## 5. Page purpose & next action

Every page type has one **primary job** and one **primary CTA**.

| Page type | Purpose | Primary CTA | Secondary CTA |
|-----------|---------|-------------|---------------|
| Overview | Explain ecosystem value and paths in | Find by Problem | Request a Match |
| Problem hub index | Choose a business problem | Open a problem | Browse layers |
| Problem detail | Map problem → layers + services + partners | Request a Match | Explore layer |
| Layers index | Show T1–T7 strategic map | Open a layer | Find by Problem |
| Layer landing | Deepen layer: solves, deliverables, partners | Request a Match | View service lines |
| Services index | Browse offer framing | Open a service | Find by Problem |
| Service line landing | Frame how delivery happens | Request a Match | View partners |
| Partner Directory | Search/filter when user already knows constraints | View profile | Request a Match |
| Partner Profile | Build trust; prove fit | Request introduction | Related partners |
| Match Request | Capture need; start governed match | Submit request | Save draft |
| My Requests | Track review status | Open request | New match |
| My Collaborations | Enter private workspace post-confirm | Open workspace | — |
| Insights index | Proof of ecosystem outcomes | Read case | Find by Problem |
| Case study | Evidence for layer/service/partner | Request a Match | View partner |
| Join as Partner | Supply-side intake | Apply to join | Contact |

---

## 6. Page templates (content model)

### 6.1 Overview `/`

**Sections**

1. Hero — premium ecosystem statement + dual CTA (Problem / Match)
2. How it works — 4 steps (Problem → Layer → Partner → Match)
3. Problem entry strip — 7 problem cards
4. Ecosystem map — T1–T7 visual navigator
5. Trust band — verified partners, review process, confidentiality
6. Featured insights — 2–3 case teasers
7. Footer CTAs — Join as Partner / Request a Match

**Tone:** Strategic, calm, B2B; no marketplace noise.

---

### 6.2 Find by Problem

#### Index `/problems`

- Headline: “Start with the problem you need to solve”
- Grid of 7 problem cards (icon, short pain statement, primary layer badge)
- Helper: “Not sure? Talk to 3HORIZONS” → match with open problem

#### Detail `/problems/:problemSlug`

| Block | Content |
|-------|---------|
| Hero | Problem name, pain statement, who typically faces it |
| What “good” looks like | Outcome framing |
| Mapped ecosystem layers | Primary + secondary with short why |
| Recommended service lines | 1–3 cards |
| Best-fit partner types | Roles / expertise patterns |
| Featured partners | 3–6 curated cards (not full dump) |
| Related insights | 1–3 cases |
| CTA band | Request a Match (pre-filled problem) |

---

### 6.3 Ecosystem layer landing `/layers/:layerSlug`

Required blocks for **each** of T1–T7:

| Block | Required content |
|-------|------------------|
| Hero | Layer code + name + one-line mandate |
| What it solves | 3–5 concrete business problems |
| Key deliverables | Typical outputs (playbooks, boards, roadmaps, etc.) |
| Relevant partner types | e.g. strategist, board advisor, FMFT coach… |
| Related service lines | Linked service cards |
| Featured partners | Verified, layer-tagged partners |
| Case examples | Layer-tagged insights |
| CTA | Request a Match (pre-filled layer) |

**Layer index `/layers`:**  
T1–T7 map with short descriptors; entry still points users who have a pain to `/problems`.

---

### 6.4 Service line landing `/services/:serviceSlug`

| Block | Content |
|-------|---------|
| Hero | Service name + problem it solves |
| Ecosystem layers covered | Layer chips with links |
| Type of partner needed | Capability profile |
| Typical deliverables | Engagement outputs |
| Recommended partners | Filtered subset |
| Engagement types | Advisory / project / retain (as applicable) |
| CTA | Request a Match (pre-filled service) |

---

### 6.5 Partner Directory `/partners`

**Not the default home.** Positioned as:

> “Browse the network when you already know filters — or start with a problem for a guided match.”

**Filters**

| Filter | Notes |
|--------|-------|
| Ecosystem layer | Multi-select T1–T7 |
| Service line | Multi-select |
| Problem type | Multi-select (7 problems) |
| Industry | Controlled vocabulary |
| Region | Country / region |
| Language | e.g. vi, en, bilingual |
| Engagement type | Advisory, project, workshop, retain |
| Verified status | Verified / pending |
| Availability | Available / limited / waitlist |

**Card fields:** name, headline expertise, layer badges, service chips, region, language, verified badge, availability, short proof line.

**Empty state:** route back to Find by Problem + Request a Match.

---

### 6.6 Partner Profile `/partners/:partnerSlug`

Deep profile (trust-first layout):

1. **Hero** — name, title/role, verified, availability, primary layers, primary CTA
2. **Expertise** — narrative + tags
3. **Ecosystem layers covered** — with depth indicators if available
4. **Services offered** — linked service lines
5. **Proof points** — metrics, credentials, selected outcomes
6. **Case studies** — linked insights
7. **Testimonials** — named where permitted
8. **Certifications**
9. **Engagement types**
10. **Availability**
11. **CTA** — Request introduction (opens match with partner pre-selected)
12. **Related partners** — same layer/problem (optional, limited)

---

### 6.7 Match workflow

```text
[Select problem]
      → [Map to primary (+ related) layer(s)]
      → [Recommend service line(s)]
      → [Show best-fit partners]
      → [Submit match request]
      → [3HORIZONS review & confirm]
      → [Private collaboration workspace]
```

#### Match Request `/match`

**Wizard steps (recommended)**

| Step | User input | System behavior |
|------|------------|-----------------|
| 1. Problem | Select problem (or free-text + suggest) | Map to layer(s) |
| 2. Context | Company context, urgency, industry, region | Refine ranking |
| 3. Service intent | Confirm/adjust recommended service line | Lock service tags |
| 4. Partner preference | Optional: pick preferred partner(s) or “let 3H match” | Soft preference only |
| 5. Review & submit | Summary + confidentiality note | Create request |

**States (My Requests)**

| Status | Meaning | User sees |
|--------|---------|-----------|
| `draft` | Incomplete | Resume |
| `submitted` | Awaiting 3H | In review |
| `in_review` | Active review | In review |
| `needs_info` | 3H asked for more | Action required |
| `matched` | Partner(s) confirmed | View match |
| `collaboration_active` | Workspace opened | Open collaboration |
| `closed` | Completed / declined | Archive |

**Governance rule:** Users never “hire” partners unilaterally. 3HORIZONS is the trust layer.

#### Collaboration workspace `/me/collaborations/:id`

Private post-match area (v1 minimum):

- Participants (client-side contact, partner, 3H facilitator)
- Shared brief / scope snapshot
- File exchange (optional phase)
- Status / next milestones
- Not a full project OS in v1 unless SOW expands

---

### 6.8 Insights / Case Studies

- Index: filter by problem, layer, service, industry
- Detail: challenge → approach → layers involved → partners (if public) → outcomes → CTA Match

---

### 6.9 Join as Partner `/join`

Supply-side funnel:

1. Fit criteria (who belongs in the network)
2. Application form (expertise, layers, services, proof, regions)
3. Review process explanation
4. Confirmation

Does not grant immediate public directory listing.

---

## 7. User journeys (primary)

### J1 — Problem-first (happy path)

1. Land on Overview  
2. Choose **Find by Problem** → e.g. Succession  
3. See T6 primary + T2/T7 related  
4. Open Succession Advisory service  
5. Review recommended partners  
6. Submit Match Request  
7. Track in **My Requests**  
8. After confirm → **My Collaborations**

### J2 — Layer-first (strategic explorer)

1. Open Ecosystem Layers map  
2. Enter T5 AI Strategy / ISAGC  
3. Read deliverables + partner types  
4. CTA Request a Match (layer pre-filled)

### J3 — Known partner (directory secondary)

1. Directory filters: T2 + Governance + verified  
2. Open profile  
3. Request introduction  
4. Match workflow with partner preference

### J4 — Partner supply

1. Join as Partner  
2. Apply → 3H review → profile published (verified)

---

## 8. Information hierarchy (visual / UX)

```text
Level 0  Brand frame (3HORIZONS Partner Network)
Level 1  Entry mode: Problem | Layer | Service | Partner (secondary)
Level 2  Detail pages (depth without clutter)
Level 3  Action: Match → Review → Collaboration
```

**Visual style constraints**

- Premium strategic B2B; beige/cream + brown/navy brand language
- Clean hierarchy; ample whitespace
- Strong trust signals: verified, review process, confidentiality
- Avoid: dense filter walls on first paint, star ratings spam, “buy now” marketplace chrome
- One primary CTA per viewport band

---

## 9. Navigation rules

1. From any problem/layer/service page, Match CTA **pre-fills** taxonomy fields.  
2. Partner Directory links back to “Prefer guided matching? Start with a problem.”  
3. Profiles do not expose direct external booking that bypasses 3HORIZONS.  
4. Related content max 3–6 cards (curated), not infinite scroll dumps on landings.  
5. Authenticated areas (Requests / Collaborations) are separate from public discovery.

---

## 10. URL & slug conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| Problem | `/problems/{slug}` | `/problems/succession` |
| Layer | `/layers/{slug}` | `/layers/ai-strategy-isagc` |
| Service | `/services/{slug}` | `/services/succession-advisory` |
| Partner | `/partners/{slug}` | `/partners/nguyen-anh` |
| Insight | `/insights/{slug}` | `/insights/board-reset-2025` |
| Match | `/match` | query or session for prefill |
| Request | `/me/requests/{id}` | UUID |
| Collaboration | `/me/collaborations/{id}` | UUID |

Prefill query example:

```text
/match?problem=succession&layer=business-succession&service=succession-advisory&partner=nguyen-anh
```

---

## 11. Entity relationships (logical model)

```text
Problem  *──*  Layer
Problem  *──*  ServiceLine
Layer    *──*  ServiceLine
Partner  *──*  Layer
Partner  *──*  ServiceLine
Partner  *──*  Problem (derived or explicit tags)
Insight  *──*  Layer | ServiceLine | Partner | Problem
MatchRequest ──> Problem, Layer[], ServiceLine[], Partner[]?, status
Collaboration ──> MatchRequest (after confirm)
```

---

## 12. Acceptance criteria (IA)

| Criterion | How IA satisfies it |
|-----------|---------------------|
| Users can enter by problem, not random profiles | Primary nav + Overview CTA + problem hubs + directory secondary |
| Sitemap feels like a strategic ecosystem | T1–T7 layers + service lines + governed match, not catalog home |
| Each page has clear purpose and next action | Section 5 purpose/CTA table |
| Layer pages are dedicated with required blocks | Section 6.3 |
| Service pages include required blocks | Section 6.4 |
| Directory is searchable/filterable with listed filters | Section 6.5 |
| Deep partner profiles with trust content | Section 6.6 |
| Match flow: problem → layer → service → partners → request → review → workspace | Section 6.7 |
| Premium B2B, low clutter, strong trust | Section 8 |

---

## 13. Out of scope for this IA doc

- Pixel-perfect UI components  
- Backend schema implementation  
- LLM/Aria chat behavior (can sit as optional assist layer later)  
- Full CMS editorial workflow  
- Payment / contracting inside portal  

These belong in architecture / SOW / build tickets.

---

## 14. Related docs

| Doc | Path |
|-----|------|
| Full route sitemap | `docs/sitemap.md` |
| Taxonomy seed data | `docs/taxonomy.md` |
| Wireflows | `docs/user-flows.md` |
| Project status | `docs/status.md` |
| Architecture (tech) | `docs/architecture.md` |
