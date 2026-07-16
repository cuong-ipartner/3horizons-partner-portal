# LinkedIn / Facebook enrichment

## Vì sao trước đây “import sai”?

Bản demo cũ **tự suy title/company/bio** từ URL (giả lập) → không đúng hồ sơ thật.

## Cách hoạt động hiện tại

`POST /api/social-enrich` (server):

| Có `PROXYCURL_API_KEY`? | Kết quả |
|-------------------------|---------|
| **Có** | Gọi Proxycurl Person Profile → name, headline, occupation, experience, certs, avatar… (public API) |
| **Không** | Chỉ parse `/in/{handle}`, thử ảnh `unavatar.io`, **không bịa** title/company |

Facebook: chỉ tín hiệu identity phụ.

Partner **luôn** rà soát màn Review trước khi gửi. Không auto-publish.

## Bật import LinkedIn thật (local)

1. Tạo key tại https://nubela.co/proxycurl/
2. Thêm vào `apps/web/.env`:

```env
PROXYCURL_API_KEY=your_key_here
```

3. Restart:

```bash
cd apps/web
npm run dev
```

4. `/join` → bước Social → dán  
   `https://www.linkedin.com/in/ten-that/` → **Import từ LinkedIn**

## Production (Cloudflare Pages)

```powershell
cd apps\web
npx wrangler pages secret put PROXYCURL_API_KEY --project-name=3horizons-partner-portal
# paste key, Enter

# Redeploy Functions so secret is live (if needed):
npx wrangler pages deploy dist --project-name=3horizons-partner-portal
```

Verify:

```text
GET https://3horizons-partner-portal.pages.dev/api/social-enrich
→ { "has_PROXYCURL_API_KEY": true, "linkedin_import": "live_proxycurl" }
```

Also optional: `XAI_API_KEY` for Nexus.

Function: `functions/api/social-enrich.ts`

## Lưu ý pháp lý / kỹ thuật

- Không scrape HTML LinkedIn (chặn + vi phạm ToS).
- Proxycurl / OAuth LinkedIn là đường đúng cho dữ liệu public/authorized.
- Chỉ điền field public; partner xác nhận trước khi save.
