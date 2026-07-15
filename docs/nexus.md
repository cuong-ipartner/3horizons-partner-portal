# Nexus — Senior strategic advisor (Grok 4.5)

## Role

| | Aria | **Nexus** |
|--|------|-----------|
| Layer | Outer (visitors / leads) | Expert (partners, clients, operators) |
| Tone | Lighter assist | Senior strategic advisor |
| Scope | Early guidance | Match, project, collaboration |

## UI

Right panel on:

- `/portal/*` (đối tác)
- `/admin/*` (operator)

Collapse → floating **Nexus** button.

## Voice → text (Speech-to-Text)

- Nút **mic** trên composer: bật/tắt nhận giọng nói
- Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- Ngôn ngữ: **vi-VN** hoặc **en-US**
- Interim transcript hiển thị live; final segment ghép vào ô nhập
- Tuỳ chọn **Tự gửi khi dừng mic**
- Chrome / Edge (localhost hoặc HTTPS) — cần quyền microphone

Không gửi audio lên server 3HORIZONS; trình duyệt chuyển STT (engine theo browser, thường Google trên Chrome).

## Memory (4 layers)

| Layer | Storage | Content |
|-------|---------|---------|
| Session | `localStorage` chat | Short-term turns |
| Project | seed + localStorage | Goal, status, owner, blockers, next action |
| Partner | seed profiles | Expertise, proof, availability |
| Global | user prefs | Name, company, language |

Rules: confirmed data only; never invent.

## API

- Model: **grok-4.5** (`https://api.x.ai/v1/chat/completions`)
- Dev proxy: Vite plugin `POST /api/nexus` (uses `XAI_API_KEY` from `.env`, not `VITE_*`)
- Prod: Cloudflare Pages Function `functions/api/nexus.ts` + secret `XAI_API_KEY`
- Without key → **demo mode** (memory-aware offline replies)

## Enable live Grok

```bash
# apps/web/.env
XAI_API_KEY=xai-...
```

Restart `npm run dev`.

Cloudflare Pages → Settings → Environment variables → `XAI_API_KEY` (encrypt).

## Files

- `src/nexus/systemPrompt.ts` — full Nexus persona
- `src/nexus/memory.ts` — 4-layer memory
- `src/nexus/client.ts` — chat client
- `src/nexus/demoReply.ts` — offline fallback
- `src/components/nexus/NexusPanel.tsx` — right panel UI
