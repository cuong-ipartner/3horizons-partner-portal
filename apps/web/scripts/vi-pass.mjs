import fs from 'node:fs'
import path from 'node:path'

const pairs = [
  ['What it solves', 'Vấn đề giải quyết'],
  ['Key deliverables', 'Sản phẩm bàn giao chính'],
  ['Partner types', 'Loại đối tác'],
  ['Related service lines', 'Dòng dịch vụ liên quan'],
  ['Featured partners', 'Đối tác nổi bật'],
  ['Case examples', 'Ví dụ case'],
  ['Open layer', 'Mở tầng'],
  ['Search', 'Tìm kiếm'],
  ['All layers', 'Tất cả tầng'],
  ['All services', 'Tất cả dịch vụ'],
  ['All problems', 'Tất cả vấn đề'],
  ['All industries', 'Tất cả ngành'],
  ['All regions', 'Tất cả khu vực'],
  ['All languages', 'Tất cả ngôn ngữ'],
  ['All types', 'Tất cả loại'],
  ['Engagement type', 'Loại engagement'],
  ['Verified status', 'Trạng thái xác minh'],
  ['Availability', 'Tình trạng sẵn sàng'],
  ['Pending', 'Chờ'],
  ['Available', 'Sẵn sàng'],
  ['Limited', 'Hạn chế'],
  ['Waitlist', 'Danh sách chờ'],
  ['Credibility summary', 'Tóm tắt uy tín'],
  ['Expertise', 'Chuyên môn'],
  ['Ecosystem coverage', 'Phủ tầng hệ sinh thái'],
  ['Services offered', 'Dịch vụ cung cấp'],
  ['Case studies', 'Case study'],
  ['Testimonials', 'Nhận xét'],
  ['Certifications', 'Chứng chỉ'],
  ['Engagement types', 'Loại engagement'],
  ['Typical deliverables', 'Sản phẩm bàn giao điển hình'],
  ['Type of partner needed', 'Loại đối tác cần'],
  ['Recommended partners', 'Đối tác đề xuất'],
  ['Recommended service lines', 'Dòng dịch vụ đề xuất'],
  ['Mapped ecosystem layers', 'Tầng hệ sinh thái được ánh xạ'],
  ['Featured partners for this problem', 'Đối tác nổi bật cho vấn đề này'],
  ['Start with the problem you need to solve', 'Bắt đầu từ vấn đề bạn cần giải quyết'],
  ['Not sure which problem fits?', 'Chưa chắc vấn đề nào phù hợp?'],
  ['Browse when you already know your filters', 'Duyệt khi đã biết bộ lọc'],
  ['No partners match these filters', 'Không có đối tác khớp bộ lọc'],
  ['Name, expertise, title…', 'Tên, chuyên môn, chức danh…'],
  ['Vietnamese', 'Tiếng Việt'],
  ['Proof from the ecosystem', 'Minh chứng từ hệ sinh thái'],
  ['Hệ thống ánh xạ', 'Ánh xạ hệ thống'],
]

const files = [
  'src/pages/ProblemsPage.tsx',
  'src/pages/LayersPage.tsx',
  'src/pages/ServicesPage.tsx',
  'src/pages/PartnersPage.tsx',
  'src/pages/InsightsPage.tsx',
  'src/pages/MatchPage.tsx',
  'src/pages/WorkspacePages.tsx',
]

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8')
  let n = 0
  for (const [en, vi] of pairs.sort((a, b) => b[0].length - a[0].length)) {
    if (s.includes(en)) {
      const c = s.split(en).length - 1
      s = s.split(en).join(vi)
      n += c
    }
  }
  fs.writeFileSync(f, s)
  console.log(f, n)
}

const fixes = [
  ['getVấn đề', 'getProblem'],
  ['getDịch vụ', 'getService'],
  ['onĐổi', 'onChange'],
  ['setDịch vụ', 'setService'],
  ['setNgành', 'setIndustry'],
  ['setKhu vực', 'setRegion'],
  ['setMức độ khẩn', 'setUrgency'],
  ['setNgữ cảnh', 'setContext'],
  ['setVấn đề', 'setProblem'],
  ['BookMở', 'BookOpen'],
  ['setĐã xác minh', 'setVerified'],
  ['Tầng hệ sinh tháis', 'Tầng hệ sinh thái'],
]

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts')) {
      let s = fs.readFileSync(p, 'utf8')
      let o = s
      for (const [a, b] of fixes) {
        while (s.includes(a)) s = s.replace(a, b)
      }
      if (s !== o) {
        fs.writeFileSync(p, s)
        console.log('refix', p)
      }
    }
  }
}
walk('src')
