import { useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import {
  Button,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Input,
  Label,
  Lead,
  PageTitle,
  Section,
  Select,
  Textarea,
} from '@/components/ui'
import { layers } from '@/data/seed'

export function JoinPage() {
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Section className="pt-12 sm:pt-16">
        <Container className="max-w-xl">
          <Card className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <PageTitle className="mt-6 text-3xl">Đã nhận hồ sơ</PageTitle>
            <Lead className="mx-auto mt-3">
              3HORIZONS rà soát hồ sơ đối tác trước khi công bố. Chúng tôi sẽ liên hệ các bước tiếp theo.
            </Lead>
            <ButtonLink className="mt-8" to="/">
              Về trang chủ
            </ButtonLink>
          </Card>
        </Container>
      </Section>
    )
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-2xl">
        <Eyebrow>Trở thành đối tác</Eyebrow>
        <PageTitle className="mt-3 text-balance">Đăng ký Mạng lưới đối tác</PageTitle>
        <Lead className="mt-4">
          Đây là hệ sinh thái chọn lọc. Hồ sơ được rà soát về chuyên môn, uy tín và phù hợp tầng — không phải đăng ký marketplace mở.
        </Lead>

        <Card className="mt-8 p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-espresso-900">Ai phù hợp tham gia</h2>
          <ul className="mt-3 space-y-2 text-sm text-espresso-600">
            <li>
              Chuyên gia cấp cao có thành tích trong chiến lược, quản trị, năng lực, thực thi, AI, kế thừa hoặc doanh nghiệp gia đình
            </li>
            <li>Sẵn sàng làm việc qua quy trình giới thiệu do 3HORIZONS kiểm soát</li>
            <li>Có minh chứng rõ ràng và tham chiếu chuyên môn</li>
          </ul>
        </Card>

        <form onSubmit={onSubmit}>
          <Card className="mt-6 space-y-5 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" required placeholder="Tên của bạn" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="ban@congty.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="title">Chức danh / lĩnh vực</Label>
              <Input id="title" required placeholder="vd. Cố vấn HĐQT & Quản trị" />
            </div>
            <div>
              <Label htmlFor="layer">Tầng hệ sinh thái chính</Label>
              <Select id="layer" required defaultValue="">
                <option value="" disabled>
                  Chọn tầng chính…
                </option>
                {layers.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="proof">Minh chứng</Label>
              <Textarea
                id="proof"
                required
                placeholder="Kết quả tiêu biểu, chứng chỉ và lý do phù hợp mạng lưới…"
              />
            </div>
            <div>
              <Label htmlFor="regions">Khu vực & ngôn ngữ</Label>
              <Input id="regions" placeholder="vd. Việt Nam / ASEAN · VI, EN" />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Gửi hồ sơ
            </Button>
          </Card>
        </form>
      </Container>
    </Section>
  )
}
