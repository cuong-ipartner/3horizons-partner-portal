/**
 * =============================================================================
 * NỘI DUNG TIẾNG VIỆT — TRANG CHỦ / HEADER / FOOTER
 * =============================================================================
 * Chỉnh sửa tại file này (demo localhost).
 *
 * Ảnh:
 * - Dùng URL tuyệt đối (CDN 3horizons.vn) HOẶC
 * - Đặt file vào `apps/web/public/images/` rồi dùng path `/images/ten-file.jpg`
 *
 * Production sau này: chuyển sang Supabase (bảng site_content + Storage).
 * =============================================================================
 */

export const brand = {
  name: '3HORIZONS',
  tagline: 'Strategy. Activated.',
  logoDark: 'https://3horizons.com/wp-content/uploads/2026/02/Logo_Dark.svg',
  logoFooter: 'https://3horizons.vn/assets/logo-footer-YB_gm3iH.png',
  mainSite: 'https://3horizons.vn',
  contactUrl: 'https://3horizons.vn/contact',
  privacyUrl: 'https://3horizons.vn/chinh-sach-bao-mat',
  cookiesUrl: 'https://3horizons.vn/chinh-sach-cookie',
}

/** Header — cấu trúc gần với 3horizons.vn */
export const headerNav = {
  items: [
    {
      label: 'Giải pháp',
      children: [
        { label: 'Chiến lược thực thi', href: 'https://3horizons.vn/giai-phap/chien-luoc-thuc-thi', external: true },
        { label: 'Chiến lược AI Doanh nghiệp', href: 'https://3horizons.vn/giai-phap/chien-luoc-ai-doanh-nghiep', external: true },
        { label: 'Chiến lược kế thừa', href: 'https://3horizons.vn/giai-phap/chien-luoc-ke-thua', external: true },
        { label: 'Quản trị công ty', href: 'https://3horizons.vn/giai-phap/quan-tri-cong-ty', external: true },
        { label: 'Quản trị rủi ro', href: 'https://3horizons.vn/giai-phap/quan-tri-rui-ro', external: true },
      ],
    },
    {
      label: 'Về chúng tôi',
      children: [
        { label: 'Công ty', href: 'https://3horizons.vn/about/company', external: true },
        { label: 'Khách hàng', href: 'https://3horizons.vn/about/client-stories', external: true },
        { label: 'Đội ngũ', href: 'https://3horizons.vn/about/team', external: true },
        { label: 'Đối tác', href: 'https://3horizons.vn/about/partners', external: true },
      ],
    },
    {
      label: 'Kiến thức',
      children: [
        { label: 'Tin tức', href: 'https://3horizons.vn/blog', external: true },
        { label: 'Tài nguyên', href: 'https://3horizons.vn/insights/resources', external: true },
        { label: 'Sự kiện', href: 'https://3horizons.vn/events', external: true },
        { label: 'Insights (portal)', href: '/insights', external: false },
      ],
    },
    {
      label: 'Mạng lưới',
      children: [
        { label: 'Tìm theo vấn đề', href: '/problems', external: false },
        { label: 'Tầng hệ sinh thái', href: '/layers', external: false },
        { label: 'Dòng dịch vụ', href: '/services', external: false },
        { label: 'Danh bạ đối tác', href: '/partners', external: false },
        { label: 'Yêu cầu kết nối', href: '/match', external: false },
      ],
    },
  ],
  ctaContact: { label: 'Liên hệ', href: brand.contactUrl, external: true },
  ctaLogin: { label: 'Đăng nhập', href: '/login' },
  ctaJoin: { label: 'Trở thành đối tác', href: '/join' },
}

/** Trang chủ — bám nội dung partners.3horizons / 3horizons.vn/partners */
export const homePage = {
  eyebrow: 'Partner Network',
  heroTitle: 'Mạng lưới đối tác',
  heroBody:
    'Lợi thế cạnh tranh của bạn là uy tín và phán đoán cá nhân — và chúng tôi khuếch đại điều đó. Là đối tác, bạn tham gia 3HORIZONS với tư cách một chuyên gia độc lập triển khai CHIẾN LƯỢC THỰC THI: nền tảng được hỗ trợ bởi AI, các workshop & coaching do chuyên gia dẫn dắt, cùng năng lực Chiến lược AI Doanh nghiệp giúp các tổ chức áp dụng Strategy as a Service.',
  heroImage: {
    src: 'https://3horizons.vn/assets/hero-team-DWDHVpJm.jpg',
    alt: 'Đội ngũ đối tác 3HORIZONS',
  },
  heroSupport:
    'Chúng tôi mang đến chiều sâu phân tích, sự liên tục trong vận hành, một phương pháp luận có khả năng mở rộng và một nền tảng giữ lại trí nhớ chiến lược của khách hàng — năm này qua năm khác.',
  heroCtas: [
    { label: 'Trở thành đối tác', href: '/join', variant: 'primary' as const },
    { label: 'Tìm chuyên gia theo vấn đề', href: '/problems', variant: 'outline' as const },
    { label: 'Đăng nhập workspace', href: '/login', variant: 'ghost' as const },
  ],

  seekingTitle: 'Chúng tôi đang tìm kiếm đối tác',
  seekingIntro:
    'Đối tác của chúng tôi là những người ra quyết định giàu kinh nghiệm, sẵn sàng thách thức tư duy thông thường và giúp các tổ chức tạo ra tác động chiến lược lớn hơn thông qua các phương pháp tiếp cận và công nghệ mới.',
  partnerTypes: [
    {
      title: 'Chuyên gia tư vấn cấp cao',
      body: 'Các chuyên gia tư vấn dày dạn kinh nghiệm, mong muốn tạo tác động lớn hơn cho khách hàng mà không bị ràng buộc bởi mô hình của một hãng tư vấn truyền thống.',
      image: 'https://3horizons.vn/assets/profile-1-DJxo6r-B.jpg',
    },
    {
      title: 'Lãnh đạo cấp cao và thành viên HĐQT',
      body: 'Lãnh đạo C-suite và thành viên hội đồng quản trị hiện tại hoặc trước đây — những người mở ra cánh cửa mà chỉ phương pháp luận thôi không thể chạm tới.',
      image: 'https://3horizons.vn/assets/profile-2-BrvpnEMK.jpg',
    },
    {
      title: 'Giáo sư trường kinh doanh',
      body: 'Giáo sư trường kinh doanh và các nhà nghiên cứu chiến lược muốn kết nối tư duy hàn lâm chặt chẽ với thực tiễn điều hành doanh nghiệp.',
      image: 'https://3horizons.vn/assets/profile-3-B38XN7SC.jpg',
    },
  ],

  benefitsTitle: 'Cơ hội và Lợi ích hợp tác',
  benefitsIntro:
    'Khám phá một cách mới để tạo tác động chiến lược — kết hợp ảnh hưởng, sự linh hoạt và đổi mới mà không bị ràng buộc bởi mô hình tư vấn truyền thống.',
  benefits: [
    {
      n: '1',
      title: 'Bước Vào Với Sự Chuẩn Bị Toàn Diện',
      body: 'Truy cập phân tích chiến lược chuyên biệt cho từng khách hàng tiềm năng — cuộc trò chuyện đầu tiên đã là một phiên đối thoại chiến lược, không phải buổi giới thiệu.',
    },
    {
      n: '2',
      title: 'Khuếch Đại Năng Lực Phán Đoán',
      body: 'Phán đoán của bạn được nâng đỡ bởi toàn bộ hệ thống 3HORIZONS: cộng đồng chuyên gia, phương pháp luận chặt chẽ và nền tảng công nghệ riêng.',
    },
    {
      n: '3',
      title: 'Tạo Giá Trị Ở Mọi Cấp Độ Đồng Hành',
      body: 'Cấu trúc kinh tế minh bạch, công bằng cho cả việc phát hiện cơ hội lẫn đồng hành tư vấn — giá trị tăng dần khi mối quan hệ khách hàng đi vào chiều sâu.',
    },
    {
      n: '4',
      title: 'Vượt Xa Phòng Họp Điều Hành',
      body: 'Với những đối tác mong muốn để lại di sản tri thức, 3HORIZONS mở ra con đường giảng dạy, nghiên cứu và lan tỏa qua mạng lưới học thuật quốc tế.',
    },
  ],
  benefitsImage: {
    src: 'https://3horizons.vn/assets/role-Bu9bi8-X.jpg',
    alt: 'Đối tác 3HORIZONS thảo luận chiến lược',
  },

  roleTitle: 'Vai Trò Của Bạn',
  roles: [
    {
      title: 'Chủ động định hình mức độ đồng hành',
      body: 'Một số đối tác tập trung vào việc phát hiện và kết nối khách hàng, một số khác đảm nhận vai trò cố vấn dẫn dắt. Cả hai đều được ghi nhận xứng đáng.',
    },
    {
      title: 'Dẫn dắt các cuộc đối thoại chiến lược',
      body: 'Dẫn dắt cuộc đối thoại chiến lược cùng khách hàng thông qua CHIẾN LƯỢC THỰC THI, mang phán đoán của bạn vào đúng những thời điểm quan trọng nhất.',
    },
    {
      title: 'Xây dựng giá trị tăng trưởng bền vững',
      body: 'Nguyên tắc Vault Principle đảm bảo mỗi engagement làm sâu thêm mối quan hệ khách hàng — cho bạn, cho 3HORIZONS và cho chính khách hàng.',
    },
  ],

  supportTitle: 'Chúng tôi đồng hành cùng bạn',
  supportIntro:
    'Bạn không bao giờ làm việc một mình. Hệ thống hỗ trợ phía sau giúp bạn dồn năng lượng vào điều quan trọng nhất: mối quan hệ với khách hàng.',
  supportImage: {
    src: 'https://3horizons.vn/assets/support-DCF9d1Jg.jpg',
    alt: 'Đội ngũ hỗ trợ 3HORIZONS',
  },
  supportItems: [
    {
      title: 'Người Đồng Hành Chiến Lược',
      body: 'Một Project Leader chuyên trách đồng hành cùng bạn — quản lý quy trình engagement và xử lý phần vận hành thương mại để bạn tập trung vào mối quan hệ tư vấn.',
    },
    {
      title: 'Mạng Lưới Đối Tác Chiến Lược',
      body: 'Truy cập cộng đồng chuyên gia cấp cao với năng lực tương đồng — chia sẻ trí tuệ thị trường, hiểu biết liên ngành và tư duy chiến lược cộng hưởng.',
    },
    {
      title: 'Hạ Tầng Vận Hành Chuẩn Doanh Nghiệp',
      body: 'Hạ tầng định chế đã được kiểm chứng: hệ thống tuân thủ cấp doanh nghiệp (ISO 27001, SOC 2, GDPR), phương pháp luận sở hữu riêng và mạng lưới học thuật bài bản.',
    },
  ],

  /** Lối vào problem-first (portal) */
  networkBridge: {
    title: 'Cần chuyên gia cho doanh nghiệp của bạn?',
    body: 'Bắt đầu từ vấn đề kinh doanh — chúng tôi dẫn tới đúng tầng hệ sinh thái, dòng dịch vụ và đối tác phù hợp. Kết nối được 3HORIZONS rà soát, không phải chợ freelancer.',
    cta: { label: 'Bắt đầu từ vấn đề của bạn', href: '/problems' },
  },

  closingTitle: 'Những cơ hội lớn bắt đầu từ một cuộc đối thoại đúng thời điểm.',
  closingBody:
    'Một cuộc trò chuyện 30 phút để cùng khám phá xem mạng lưới đối tác của 3HORIZONS có phù hợp với hành trình tiếp theo của bạn hay không.',
  closingCta: { label: 'Liên hệ ngay', href: brand.contactUrl, external: true },

  trustBadges: [
    { src: 'https://3horizons.vn/assets/great-place-to-work-BlVkUPuF.png', alt: 'Great Place to Work Certified' },
    { src: 'https://3horizons.vn/assets/soc2-ioPuJlGP.png', alt: 'AICPA SOC 2 Type 2' },
    { src: 'https://3horizons.vn/assets/iso-27001-j6HdyOmq.png', alt: 'ISO 27001:2022 Certified' },
    { src: 'https://3horizons.vn/assets/cyber-essentials-DNi7NPOo.png', alt: 'Cyber Essentials Certified' },
  ],
}

export type HomePageContent = typeof homePage
export type PartnerTypeContent = (typeof homePage.partnerTypes)[number]
export type BenefitContent = (typeof homePage.benefits)[number]
export type RoleContent = (typeof homePage.roles)[number]
export type SupportItemContent = (typeof homePage.supportItems)[number]

/** Footer tiếng Việt — bám 3horizons.vn */
export const footerVi = {
  columns: [
    {
      title: 'Giới thiệu',
      links: [
        { label: 'Về chúng tôi', href: 'https://3horizons.vn/about/company', external: true },
        { label: 'Đội ngũ', href: 'https://3horizons.vn/about/team', external: true },
        { label: 'Tuyển dụng', href: 'https://3horizons.vn/careers', external: true },
        { label: 'Liên hệ', href: brand.contactUrl, external: true },
      ],
    },
    {
      title: 'Giải pháp',
      links: [
        { label: 'Chiến lược thực thi', href: 'https://3horizons.vn/giai-phap/chien-luoc-thuc-thi', external: true },
        { label: 'Chiến lược AI Doanh nghiệp', href: 'https://3horizons.vn/giai-phap/chien-luoc-ai-doanh-nghiep', external: true },
        { label: 'Chiến lược kế thừa', href: 'https://3horizons.vn/giai-phap/chien-luoc-ke-thua', external: true },
        { label: 'Quản trị rủi ro', href: 'https://3horizons.vn/giai-phap/quan-tri-rui-ro', external: true },
      ],
    },
    {
      title: 'Mạng lưới đối tác',
      links: [
        { label: 'Tìm theo vấn đề', href: '/problems', external: false },
        { label: 'Danh bạ đối tác', href: '/partners', external: false },
        { label: 'Yêu cầu kết nối', href: '/match', external: false },
        { label: 'Trở thành đối tác', href: '/join', external: false },
        { label: 'Đăng nhập portal', href: '/login', external: false },
      ],
    },
    {
      title: 'Tài nguyên',
      links: [
        { label: 'Bài viết', href: 'https://3horizons.vn/blog', external: true },
        { label: 'Insights portal', href: '/insights', external: false },
        { label: 'Chính sách bảo mật', href: brand.privacyUrl, external: true },
        { label: 'Cookies', href: brand.cookiesUrl, external: true },
      ],
    },
  ],
  blurb:
    'Strategy. Activated. Đồng hành cùng đội ngũ lãnh đạo trên hành trình biến chiến lược thành kết quả.',
  copyright: '© 2026 3HORIZONS. Bảo lưu mọi quyền.',
  newsletterNote: 'Insight chiến lược hàng tháng. Bạn có thể huỷ bất cứ lúc nào.',
}
