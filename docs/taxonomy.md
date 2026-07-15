# Taxonomy seed — 3HORIZONS Partner Network

**Version:** 1.0  
**Updated:** 2026-07-14  
**Use:** content seed, filters, routing, match prefill

---

## 1. Ecosystem layers

```yaml
layers:
  - code: T1
    name: Corporate Strategy
    slug: corporate-strategy
    mandate: Clarify direction, choices, and strategic priorities for the enterprise.
    solves:
      - Unclear corporate direction and competing priorities
      - Strategy that does not translate into choices
      - Misalignment between leadership on where to play / how to win
    partner_types:
      - Corporate strategist
      - Transformation advisor
      - Industry strategy specialist
    related_services:
      - corporate-strategy
      - capability-building
      - performance-execution

  - code: T2
    name: Corporate Governance
    slug: corporate-governance
    mandate: Strengthen board effectiveness, oversight, and decision rights.
    solves:
      - Weak board cadence and unclear decision rights
      - Governance risk and compliance blind spots
      - Founder/CEO–board tension
    partner_types:
      - Board advisor
      - Governance specialist
      - Independent director / coach
    related_services:
      - governance
      - corporate-strategy
      - family-governance

  - code: T3
    name: Capability / FMFT
    slug: capability-fmft
    mandate: Build the organizational capabilities required to execute strategy (FMFT).
    solves:
      - Capability gaps blocking strategy
      - Leadership bench and operating system weakness
      - Skills and routines not matching ambition
    partner_types:
      - Capability builder
      - Leadership / FMFT coach
      - Org design advisor
    related_services:
      - capability-building
      - corporate-strategy
      - performance-execution

  - code: T4
    name: Execution / SKALE
    slug: execution-skale
    mandate: Drive performance discipline and scalable execution (SKALE).
    solves:
      - Strategy–execution gap
      - Weak operating rhythm and KPI ownership
      - Performance stalls and delivery failure
    partner_types:
      - Execution / PMO lead
      - Performance coach
      - Operating model specialist
    related_services:
      - performance-execution
      - corporate-strategy
      - capability-building

  - code: T5
    name: AI Strategy / ISAGC
    slug: ai-strategy-isagc
    mandate: Define AI strategy and governance (ISAGC) aligned to enterprise value.
    solves:
      - AI pilots without strategy
      - Missing AI governance and risk controls
      - Unclear value cases and operating model for AI
    partner_types:
      - AI strategy advisor
      - AI governance specialist
      - Digital transformation lead
    related_services:
      - ai-strategy
      - corporate-strategy
      - governance

  - code: T6
    name: Business Succession
    slug: business-succession
    mandate: Design and de-risk leadership and ownership succession.
    solves:
      - Unclear succession plan for key roles / ownership
      - Continuity risk for family or founder businesses
      - Handover without readiness
    partner_types:
      - Succession advisor
      - Family business consultant
      - Leadership transition coach
    related_services:
      - succession-advisory
      - governance
      - family-governance

  - code: T7
    name: Family Governance
    slug: family-governance
    mandate: Align family owners on purpose, rights, and multi-generation governance.
    solves:
      - Family conflict over ownership and roles
      - Missing family constitution / forums
      - Blurred family vs business decisions
    partner_types:
      - Family governance advisor
      - Family office consultant
      - Mediation / facilitation specialist
    related_services:
      - family-governance
      - governance
      - succession-advisory
```

---

## 2. Problems (entry points)

```yaml
problems:
  - name: Strategy clarity
    slug: strategy-clarity
    pain: Leadership is not aligned on direction, priorities, or strategic choices.
    primary_layers: [corporate-strategy]
    secondary_layers: [capability-fmft, execution-skale]
    service_lines: [corporate-strategy, capability-building, performance-execution]

  - name: Governance / board
    slug: governance-board
    pain: Board and decision rights are unclear, weak, or not trusted.
    primary_layers: [corporate-governance]
    secondary_layers: [corporate-strategy, family-governance]
    service_lines: [governance, corporate-strategy, family-governance]

  - name: Capability / FMFT
    slug: capability-fmft
    pain: The organization lacks the capabilities and leadership system to deliver strategy.
    primary_layers: [capability-fmft]
    secondary_layers: [corporate-strategy, execution-skale]
    service_lines: [capability-building, corporate-strategy, performance-execution]

  - name: Execution / performance
    slug: execution-performance
    pain: Plans exist but performance, rhythm, and delivery do not scale.
    primary_layers: [execution-skale]
    secondary_layers: [corporate-strategy, capability-fmft]
    service_lines: [performance-execution, corporate-strategy, capability-building]

  - name: AI strategy / governance
    slug: ai-strategy-governance
    pain: AI initiatives lack strategy, governance, and enterprise value framing.
    primary_layers: [ai-strategy-isagc]
    secondary_layers: [corporate-strategy, corporate-governance]
    service_lines: [ai-strategy, corporate-strategy, governance]

  - name: Succession
    slug: succession
    pain: Leadership or ownership transition is undefined or high-risk.
    primary_layers: [business-succession]
    secondary_layers: [corporate-governance, family-governance]
    service_lines: [succession-advisory, governance, family-governance]

  - name: Family governance
    slug: family-governance
    pain: Family owners need shared rules, forums, and decision discipline.
    primary_layers: [family-governance]
    secondary_layers: [corporate-governance, business-succession]
    service_lines: [family-governance, governance, succession-advisory]
```

---

## 3. Service lines

```yaml
service_lines:
  - name: Corporate Strategy Services
    slug: corporate-strategy
    solves: Strategy clarity and enterprise direction
    layers: [corporate-strategy, capability-fmft, execution-skale]
    partner_needed: Corporate strategists and transformation advisors
    typical_deliverables:
      - Strategic choices & priority portfolio
      - Growth / portfolio options
      - Leadership alignment workshops
      - Strategy cascade roadmap

  - name: Governance Services
    slug: governance
    solves: Board effectiveness and decision rights
    layers: [corporate-governance, corporate-strategy, family-governance]
    partner_needed: Board and governance specialists
    typical_deliverables:
      - Board effectiveness review
      - Decision-rights matrix
      - Governance calendar & charter updates
      - Risk oversight design

  - name: Capability Building Services
    slug: capability-building
    solves: FMFT and organizational capability gaps
    layers: [capability-fmft, corporate-strategy, execution-skale]
    partner_needed: Capability builders and leadership coaches
    typical_deliverables:
      - Capability assessment
      - FMFT development programs
      - Leadership bench plans
      - Operating routines design

  - name: Performance Execution Services
    slug: performance-execution
    solves: Execution discipline and scalable performance
    layers: [execution-skale, corporate-strategy, capability-fmft]
    partner_needed: Execution leads and performance specialists
    typical_deliverables:
      - SKALE / execution system design
      - KPI ownership model
      - Performance war-room cadence
      - Delivery recovery plans

  - name: AI Strategy Services
    slug: ai-strategy
    solves: AI strategy and AI governance alignment
    layers: [ai-strategy-isagc, corporate-strategy, corporate-governance]
    partner_needed: AI strategy and governance advisors
    typical_deliverables:
      - AI strategy & value roadmap
      - ISAGC governance model
      - Use-case portfolio prioritization
      - Risk & control framework

  - name: Succession Advisory Services
    slug: succession-advisory
    solves: Leadership and ownership succession risk
    layers: [business-succession, corporate-governance, family-governance]
    partner_needed: Succession and transition advisors
    typical_deliverables:
      - Succession readiness assessment
      - Role & ownership transition plan
      - Successor development roadmap
      - Continuity risk controls

  - name: Family Governance Services
    slug: family-governance
    solves: Family alignment and multi-generation governance
    layers: [family-governance, corporate-governance, business-succession]
    partner_needed: Family governance and family-office advisors
    typical_deliverables:
      - Family constitution / charter
      - Family council design
      - Ownership protocols
      - Conflict facilitation frameworks
```

---

## 4. Directory filter vocabularies

```yaml
filters:
  ecosystem_layer: [T1..T7 slugs]
  service_line: [service slugs]
  problem_type: [problem slugs]
  industry:
    - manufacturing
    - financial-services
    - consumer
    - healthcare
    - technology
    - real-estate
    - energy
    - professional-services
    - public-sector
    - other
  region:
    - vietnam
    - asean
    - apac
    - europe
    - north-america
    - middle-east
    - global-remote
  language:
    - vi
    - en
    - bilingual-vi-en
    - other
  engagement_type:
    - advisory
    - project
    - workshop
    - retain
    - board-role
  verified_status:
    - verified
    - pending
  availability:
    - available
    - limited
    - waitlist
```

---

## 5. Routing helper (implementation sketch)

```ts
// Conceptual — problem → primary recommendation
type Recommendation = {
  problem: string;
  primaryLayer: string;
  relatedLayers: string[];
  primaryService: string;
  relatedServices: string[];
};

// Example: succession
// primaryLayer: business-succession
// primaryService: succession-advisory
```

Match wizard always starts from `problem` when available; layer/service are derived then user-adjustable.
