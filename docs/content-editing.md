# Cách chỉnh sửa nội dung & hình ảnh (tiếng Việt)

## Font tiếng Việt

| Vai trò | Font |
|---------|------|
| Body / UI | **Inter** |
| Heading (H1–H6, `.font-display`) | **Be Vietnam Pro** |

Nguồn: Google Fonts trong `index.html`.

---

## Admin đơn giản (khuyến nghị cho demo)

1. Đăng nhập portal: http://localhost:5173/login  
2. Mở **Admin nội dung**: http://localhost:5173/portal/admin  
3. Mật khẩu demo: `3horizons`  
4. Sửa section (Hero, Tìm đối tác, Lợi ích, …) → **Lưu**  
5. Mở trang chủ để xem

Dữ liệu lưu **localStorage** trình duyệt (không cần Supabase).  
Nút **Mặc định** xóa bản ghi local.

---

## File mặc định (seed code)

**Trang chủ + header + footer mặc định:**

```text
apps/web/src/content/site-vi.ts
```

Admin ghi đè lên seed qua localStorage. Khi reset, quay về file này.

### Sửa chữ

| Muốn đổi | Tìm trong `site-vi.ts` |
|----------|-------------------------|
| Tiêu đề hero “Mạng lưới đối tác” | `homePage.heroTitle` |
| Đoạn mô tả hero | `homePage.heroBody`, `heroSupport` |
| Nút CTA | `homePage.heroCtas` |
| 3 loại đối tác | `homePage.partnerTypes` |
| Lợi ích 1–4 | `homePage.benefits` |
| Vai trò / đồng hành | `homePage.roles`, `supportItems` |
| Menu header | `headerNav` |
| Cột footer | `footerVi` |
| Logo / link liên hệ | `brand` |

### Sửa ảnh

**Cách A — URL CDN (đang dùng từ 3horizons.vn):**

```ts
heroImage: {
  src: 'https://3horizons.vn/assets/hero-team-DWDHVpJm.jpg',
  alt: 'Đội ngũ đối tác 3HORIZONS',
},
```

Đổi `src` sang URL ảnh mới.

**Cách B — Ảnh local (khuyến nghị khi tự host):**

1. Copy file vào:

```text
apps/web/public/images/hero-partners.jpg
```

2. Trong `site-vi.ts`:

```ts
src: '/images/hero-partners.jpg',
```

Kích thước gợi ý:

| Vị trí | Tỉ lệ | Độ rộng gợi ý |
|--------|-------|----------------|
| Hero | 4:3 | 1600px |
| Partner type cards | 16:10 | 800px |
| Benefits side | 4:5 | 900px |
| Support | 4:3 | 1200px |
| Trust badges | PNG/SVG trong suốt | cao ~80–120px |

---

## Quy trình edit demo

```text
1. Sửa apps/web/src/content/site-vi.ts
2. (Nếu ảnh local) thả file vào apps/web/public/images/
3. npm run dev  →  xem http://localhost:5173/
4. Commit khi ổn
```

**Không** hard-code text dài trong component nếu có thể — giữ trong `site-vi.ts` để marketing edit dễ.

---

## Production (sau này) — 3 tầng

| Giai đoạn | Ai edit | Công cụ |
|-----------|---------|---------|
| **A. Demo / MVP** | Dev / bạn | File `site-vi.ts` + `public/images` |
| **B. Supabase CMS nhẹ** | Admin 3H | Bảng `site_pages`, `site_blocks` + Storage bucket `site-media` |
| **C. CMS full** | Marketing | Sanity / Payload / Directus (headless) nối API |

### Giai đoạn B (đề xuất khi lên partners.3horizons.vn)

```text
Supabase
├── site_content (key, locale, json payload)
├── partners (đã có hướng schema)
└── storage: site-media (public read)

Admin (trong /portal/account hoặc /admin)
├── Form sửa hero / sections
└── Upload ảnh → Storage → lưu URL vào site_content
```

Frontend: `VITE_DATA_MODE=supabase` → fetch content; fallback seed nếu lỗi.

---

## Lưu ý

- Ảnh hotlink từ `3horizons.vn` chỉ ổn cho demo; production nên copy vào Cloudflare / Supabase Storage (tránh phụ thuộc CDN site chính).  
- Giữ bản quyền / brand guideline 3HORIZONS.  
- Nội dung tiếng Việt client-facing; code/comment tiếng Anh.

---

## Checklist khi đổi landing partners

- [ ] Hero title + body  
- [ ] 3 partner type cards + ảnh  
- [ ] 4 benefits  
- [ ] Roles + support  
- [ ] Closing CTA + link Liên hệ  
- [ ] Header menu + footer links  
- [ ] Trust badges  
