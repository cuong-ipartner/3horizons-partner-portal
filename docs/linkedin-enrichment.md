# LinkedIn / Facebook enrichment (optional API)

## Join flow (production)

**`/join` không còn import LinkedIn/Facebook.**  
Partner nhập hồ sơ thủ công; URL LinkedIn/Facebook (nếu có) chỉ là field tuỳ chọn.

API `POST /api/social-enrich` vẫn có thể dùng sau (admin tools / future), không gắn UI join.

## Proxycurl (server, optional)

`POST /api/social-enrich`:

| Có `PROXYCURL_API_KEY`? | Kết quả |
|-------------------------|---------|
| **Có** | Proxycurl Person Profile → name, headline, experience… |
| **Không** | Chỉ parse handle — không bịa title/company |

Không auto-publish.

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
