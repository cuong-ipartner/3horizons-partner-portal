import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'Inter, system-ui, sans-serif',
            background: '#f7f3ec',
            color: '#2c2416',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#fff',
              borderRadius: 16,
              padding: 28,
              border: '1px solid #e2d4bf',
              boxShadow: '0 8px 24px rgba(28,22,16,0.06)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#7a6a55' }}>
              3HORIZONS
            </p>
            <h1 style={{ fontSize: 22, margin: '8px 0 12px' }}>Đã xảy ra lỗi giao diện</h1>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: '#5c4f3d' }}>
              Ứng dụng đã bắt lỗi thay vì crash trắng. Bạn có thể tải lại trang hoặc xoá dữ liệu
              demo local (draft onboarding / content) rồi thử lại.
            </p>
            <pre
              style={{
                marginTop: 16,
                padding: 12,
                background: '#f7f3ec',
                borderRadius: 8,
                fontSize: 11,
                overflow: 'auto',
                maxHeight: 120,
              }}
            >
              {this.state.error.message}
            </pre>
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: '10px 16px',
                  background: '#24305c',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Về trang chủ
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('3h-partner-onboarding-draft-v1')
                    localStorage.removeItem('3h-partner-home-content-v1')
                    localStorage.removeItem('3h-nexus-session-messages-v1')
                  } catch {
                    /* ignore */
                  }
                  window.location.reload()
                }}
                style={{
                  border: '1px solid #e2d4bf',
                  borderRadius: 999,
                  padding: '10px 16px',
                  background: '#fdfbf7',
                  color: '#2c2416',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Xoá cache demo & reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
