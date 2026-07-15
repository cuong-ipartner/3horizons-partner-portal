/**
 * Offline / fallback Nexus replies when XAI_API_KEY is not configured.
 * Plain Vietnamese text — no markdown bold.
 */

import {
  buildMemoryContextBlock,
  getSeedPartnerMemories,
  loadProjectMemories,
  type NexusMessage,
} from '@/nexus/memory'
import { NEXUS_OPENING_VI } from '@/nexus/systemPrompt'
import { problems } from '@/data/seed'

function lastUserText(messages: NexusMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content
  }
  return ''
}

export function nexusDemoReply(messages: NexusMessage[], routePath?: string): string {
  const text = lastUserText(messages).toLowerCase()
  const projects = loadProjectMemories()
  const active = projects.find((p) => p.status === 'Active collaboration') ?? projects[0]
  const partners = getSeedPartnerMemories()

  if (!text || /^(hi|hello|chào|xin chào|hey)\b/.test(text.trim())) {
    return NEXUS_OPENING_VI
  }

  // Partner portal: never send users to /match
  if (
    /\/match|yêu cầu kết nối|gửi match|tạo match|form match|match request|ghép nối/.test(text) ||
    (/\bmatch\b/.test(text) && /gửi|tạo|form|yêu cầu|request/.test(text))
  ) {
    return [
      'Trên workspace đối tác không gửi yêu cầu matching.',
      '',
      'Matching do 3HORIZONS điều phối (khách / matching desk). Partner dùng portal để:',
      '- Cập nhật hồ sơ và năng lực',
      '- Hoàn thành huấn luyện / onboarding',
      '- Làm việc trên dự án hợp tác đã được mở',
      '',
      'Bước tiếp theo: mở Dự án hợp tác hoặc Huấn luyện, hoặc liên hệ facilitator nếu cần hỗ trợ engagement.',
    ].join('\n')
  }

  if (
    /partner|đối tác|tìm chuyên|cần tư vấn|ai strategy|kế thừa|succession|governance|hđqt/.test(
      text,
    )
  ) {
    const problem =
      problems.find(
        (p) =>
          text.includes(p.slug) ||
          text.includes(p.name.toLowerCase()) ||
          (p.slug === 'succession' && /kế thừa|succession/.test(text)) ||
          (p.slug === 'ai-strategy-governance' && /ai/.test(text)) ||
          (p.slug === 'governance-board' && /hđqt|board|governance|quản trị/.test(text)) ||
          (p.slug === 'strategy-clarity' && /chiến lược|strategy/.test(text)),
      ) ?? problems[0]

    const fit = partners
      .filter(
        (p) =>
          p.layers.some(
            (l) => problem.primaryLayer.includes(l.split('-')[0]) || problem.primaryLayer === l,
          ) || p.expertise.join(' ').toLowerCase().includes(problem.slug.split('-')[0]),
      )
      .slice(0, 2)

    const fallbackFit = partners.filter((p) =>
      p.expertise.some((e) => text.includes(e.toLowerCase().slice(0, 6))),
    )
    const chosen = fit.length ? fit : fallbackFit.length ? fallbackFit : partners.slice(0, 2)

    const lines = chosen.map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.expertise.slice(0, 2).join(', ')}. Sẵn sàng: ${p.availability}. ${p.proofPoints[0] ?? ''}`,
    )

    return [
      `Vấn đề bạn mô tả gần với: ${problem.name}. ${problem.pain}`,
      '',
      'Partner phù hợp (dựa trên dữ liệu đã xác minh):',
      ...lines,
      '',
      'Bước tiếp theo: mở Mạng lưới trong portal để tham chiếu hệ sinh thái, hoặc liên hệ facilitator nếu cần điều phối engagement. Matching không gửi từ portal đối tác.',
    ].join('\n')
  }

  if (/dự án|project|collaboration|milestone|blocker|tiếp theo|next step|trạng thái/.test(text)) {
    if (!active) {
      return 'Hiện chưa có dự án active trong bộ nhớ. Hãy mở mục Dự án hợp tác trên portal, hoặc cho mình biết mã dự án.\n\nBước tiếp theo: chọn một collaboration để Nexus theo dõi.'
    }
    return [
      `${active.title} đang ở trạng thái: ${active.status}.`,
      '',
      `- Mục tiêu: ${active.objective ?? active.title}`,
      `- Phụ trách: ${active.owner ?? '—'}`,
      `- Việc tiếp theo: ${active.nextAction ?? '—'}`,
      `- Rào cản: ${(active.blockers ?? []).join('; ') || 'Không ghi nhận'}`,
      '- Các mốc:',
      ...(active.milestones ?? []).map((m) => `  - ${m}`),
      '',
      'Bước tiếp theo: xác nhận mốc chưa xong trong Dự án hợp tác, hoặc cập nhật rào cản nếu đã đổi. Bạn muốn mình soạn agenda cho bước kế tiếp không?',
    ].join('\n')
  }

  if (/đâu|ở đâu|vào đâu|navigate|menu|tài liệu|huấn luyện|dashboard|portal|account/.test(text)) {
    return [
      'Trên portal đối tác, chọn khu vực theo mục tiêu:',
      '',
      '- Bảng điều khiển (/portal): tiến độ và thao tác nhanh',
      '- Tài liệu (/portal/documents): SOP, mẫu, tài liệu nền',
      '- Huấn luyện (/portal/training): module enablement',
      '- Dự án hợp tác (/portal/projects): workspace collaboration',
      '- Mạng lưới (/portal/network): tham chiếu hệ sinh thái (không gửi match)',
      '- Tài khoản (/portal/account): hồ sơ và cài đặt',
      '',
      'Lưu ý: form matching (/match) không dành cho đối tác — do 3HORIZONS / khách điều phối.',
      '',
      'Bước tiếp theo: cho mình biết bạn cần tài liệu, training hay điều phối dự án.',
    ].join('\n')
  }

  if (/vấn đề|problem|chiến lược|diagnose|làm rõ|khó khăn/.test(text)) {
    return [
      'Để chẩn đoán gọn: vấn đề thật → context đã biết → bước tiếp theo.',
      '',
      'Chọn một hướng gần nhất:',
      ...problems.slice(0, 5).map((p) => `- ${p.name}: ${p.pain}`),
      '',
      'Bước tiếp theo: chọn một nhãn vấn đề ở trên (hoặc mô tả 1 câu pain chính). Mình sẽ map tầng hệ sinh thái và gợi ý partner phù hợp.',
    ].join('\n')
  }

  void buildMemoryContextBlock({ routePath })
  return [
    'Mình hiểu bạn cần hỗ trợ trên workspace đối tác. Nexus có thể: (1) làm rõ vấn đề chiến lược, (2) điều phối dự án hợp tác, (3) hướng dẫn tài liệu / huấn luyện, (4) dẫn hướng portal.',
    '',
    active
      ? `Dự án đang mở: ${active.title} — ${active.nextAction ?? 'chưa có việc tiếp theo'}.`
      : 'Chưa gắn dự án cụ thể trong session.',
    '',
    'Matching không gửi từ portal đối tác. Bước tiếp theo: bạn muốn đi theo hướng chiến lược, huấn luyện, hay điều phối dự án?',
  ].join('\n')
}
