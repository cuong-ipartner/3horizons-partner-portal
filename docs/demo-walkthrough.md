# Localhost demo walkthrough

**Base:** http://localhost:5173  
**Mode:** seed data (yellow banner)  
**Time:** ~10–15 minutes  

---

## Script for stakeholders

### 1. Partner Network (public) — problem-first

1. Open **/** — Overview  
   - Hero: “Start by describing your problem”  
   - Not a marketplace  
2. Click **Start by describing your problem** → **/problems**  
3. Open **Succession** (or Strategy clarity)  
   - Primary layer + services + featured partners  
4. Click **Request a Match** → wizard prefilled  
5. Optional side paths:  
   - **/layers** — T1–T7  
   - **/partners** — directory secondary  
   - **/insights** — proof  

**Talking point:** Users enter by problem → layer → service → governed match.

---

### 2. Login + workspace shell

1. **/login**  
   - Gradient + centered card  
   - Any email/password → Sign in  
2. Lands on **/portal** dashboard  
   - Top bar: search, region, language, avatar  
   - Sidebar: Dashboard, Tài liệu, Huấn luyện, Dự án, Partner Network, Account  

---

### 3. Portal dashboard content

On **/portal** show:

- Quick actions  
- Task status  
- Recent documents  
- Active projects  
- Partner match requests  

Click avatar → Profile, Security, Billing, Activity, Help, Log out.

---

### 4. Sidebar tour

| Menu | Path | Show |
|------|------|------|
| Tài liệu | `/portal/documents` | Doc list |
| Huấn luyện | `/portal/training` | Progress modules |
| Dự án hợp tác | `/portal/projects` | Active / paused |
| Partner Network | `/portal/network` | Bridge to public network |
| Account | `/portal/account` | Profile control center |

---

### 5. Close the loop

1. From portal → **Open Network** / Find by Problem  
2. Submit match → **/match/confirmation**  
3. **/me/requests** — status board  
4. Log out from avatar → back to login  

---

## Demo credentials (UI only)

| Field | Value |
|-------|--------|
| Email | anything@company.com |
| Password | anything |

No Supabase yet — login always succeeds.

---

## What is *not* live yet

- Real auth / Google OAuth  
- Supabase persistence  
- File downloads  
- Admin review queue  
- Production domain partners.3horizons.vn  

---

## After demo

- [ ] UI approved for next phase?  
- [ ] Create Supabase project  
- [ ] Wire auth + tables  
- [ ] Cloudflare Pages + partners.3horizons.vn  
