import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { taskApi, Task } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

const PRIORITY_LABELS: Record<string, string> = {
  critical: '严重', high: '高', medium: '中', low: '低',
};

const STATUS_LABELS: Record<string, string> = {
  todo: '待办', in_progress: '进行中', review: '审核中', done: '已完成',
};

const CATEGORY_LABELS: Record<string, string> = {
  work: '工作', personal: '个人', study: '学习', health: '健康', finance: '财务',
};

export default function TaskDetail() {
  const { logout } = useAuth();
  const { isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  if (authLoading) {
    return (
      <>
        <Head><title>加载中... - 我的小本本</title></Head>
        <main className="container"><div className="empty-state"><p>加载中...</p></div></main>
      </>
    );
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    taskApi
      .getTask(Number(id))
      .then(setTask)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('加载任务详情失败');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!task || !confirm(`确定要删除任务"${task.title}"吗？此操作不可恢复。`)) return;
    try {
      await taskApi.deleteTask(task.id);
      toast.success('任务已删除');
      router.push('/');
    } catch {
      toast.error('删除失败');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '未设置';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const now = new Date();
    const due = new Date(dateStr);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <>
        <Head><title>加载中... - 我的小本本</title></Head>
        <header className="header">
          <div className="container header-content">
            <span className="logo">我的小本本</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" className="btn btn-secondary">返回列表</Link>
              <button className="btn btn-secondary btn-sm" onClick={logout}>退出</button>
            </div>
          </div>
        </header>
        <main className="container">
          <div className="empty-state"><p>加载中...</p></div>
        </main>
      </>
    );
  }

  if (notFound || !task) {
    return (
      <>
        <Head><title>任务不存在 - 我的小本本</title></Head>
        <header className="header">
          <div className="container header-content">
            <span className="logo">我的小本本</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" className="btn btn-secondary">返回列表</Link>
              <button className="btn btn-secondary btn-sm" onClick={logout}>退出</button>
            </div>
          </div>
        </header>
        <main className="container">
          <div className="empty-state">
            <h3>任务不存在</h3>
            <p>该任务可能已被删除或ID无效</p>
            <Link href="/" className="btn btn-primary">返回仪表盘</Link>
          </div>
        </main>
      </>
    );
  }

  const daysRemaining = getDaysRemaining(task.due_date);

  return (
    <>
      <Head>
        <title>瞅瞅这个任务 - 我的小本本</title>
      </Head>

      <header className="header">
        <div className="container header-content">
          <span className="logo">我的小本本</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" className="btn btn-secondary">返回列表</Link>
            <button className="btn btn-secondary btn-sm" onClick={logout}>退出</button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="breadcrumb">
          <Link href="/">仪表盘</Link>
          <span className="separator">/</span>
          <span>{task.title}</span>
        </div>

        <div className="detail-actions">
          <Link href={`/tasks/${task.id}/edit`} className="btn btn-primary">编辑任务</Link>
          <button className="btn btn-danger" onClick={handleDelete}>删除任务</button>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <h1 className="detail-title">{task.title}</h1>
            <div className="detail-meta">
              <span className={`badge badge-priority-${task.priority}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className={`badge badge-status-${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
              <span className="badge badge-category">
                {CATEGORY_LABELS[task.category] || task.category}
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>
                进度：{task.progress}%
              </label>
              <div className="progress-bar" style={{ width: '100%', height: 8 }}>
                <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
              </div>
            </div>

            {task.description && (
              <>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>
                  描述
                </label>
                <div className="detail-description">{task.description}</div>
              </>
            )}
          </div>

          <div className="detail-sidebar">
            <div className="detail-info-item">
              <span className="detail-info-label">截止日期</span>
              <span className="detail-info-value">
                {formatDate(task.due_date)}
                {daysRemaining !== null && task.status !== 'done' && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: daysRemaining < 0 ? 'var(--danger)' : daysRemaining <= 3 ? 'var(--warning)' : 'var(--success)',
                  }}>
                    {daysRemaining < 0
                      ? `已逾期 ${Math.abs(daysRemaining)} 天`
                      : daysRemaining === 0
                        ? '今天截止'
                        : `剩余 ${daysRemaining} 天`}
                  </span>
                )}
              </span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">分类</span>
              <span className="detail-info-value">
                {CATEGORY_LABELS[task.category] || task.category}
              </span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">预计耗时</span>
              <span className="detail-info-value">
                {task.estimated_hours ? `${task.estimated_hours} 小时` : '未设置'}
              </span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">创建时间</span>
              <span className="detail-info-value">{formatDate(task.created_at)}</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">更新时间</span>
              <span className="detail-info-value">{formatDate(task.updated_at)}</span>
            </div>
            {task.tags && task.tags.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <span className="detail-info-label" style={{ display: 'block', marginBottom: 6 }}>标签</span>
                <div className="detail-tags">
                  {task.tags.map((tag, idx) => (
                    <span key={idx} className="detail-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
