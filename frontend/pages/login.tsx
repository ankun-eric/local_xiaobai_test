import { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const BASE_PATH = '/autodev/a46094c5-4cff-434b-a815-3e73fc6d39a6';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    router.replace(`${BASE_PATH}/`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('请输入用户名');
      return;
    }
    if (!password) {
      toast.error('请输入密码');
      return;
    }

    setSubmitting(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        toast.success('登录成功，正在跳转...');
        router.replace(`${BASE_PATH}/`);
      } else {
        toast.error('用户名或密码错误');
      }
    } catch {
      toast.error('登录失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>登录 - 牛逼哄哄的管理系统</title>
      </Head>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 16,
            padding: '40px 36px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--accent), #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 8,
              }}
            >
              牛逼哄哄的管理系统
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              请登录以继续使用
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'var(--text)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'var(--text)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px 20px',
                fontSize: 16,
                borderRadius: 10,
              }}
            >
              {submitting ? '登录中...' : '登 录'}
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'rgba(6, 182, 212, 0.08)',
              borderRadius: 8,
              border: '1px solid rgba(6, 182, 212, 0.15)',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              提示：默认管理员账号为 <strong style={{ color: 'var(--accent)' }}>admin</strong>，
              密码为 <strong style={{ color: 'var(--accent)' }}>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
