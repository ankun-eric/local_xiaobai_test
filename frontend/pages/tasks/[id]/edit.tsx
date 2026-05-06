import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { taskApi, Task } from '@/lib/api';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS = [
  { value: 'critical', label: '严重' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'review', label: '审核中' },
  { value: 'done', label: '已完成' },
];

const CATEGORY_OPTIONS = [
  { value: 'work', label: '工作' },
  { value: 'personal', label: '个人' },
  { value: 'study', label: '学习' },
  { value: 'health', label: '健康' },
  { value: 'finance', label: '财务' },
];

export default function EditTask() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    category: 'personal',
    due_date: '',
    estimated_hours: '',
    tags: '',
    progress: 0,
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    taskApi
      .getTask(Number(id))
      .then((task) => {
        setForm({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          category: task.category,
          due_date: task.due_date
            ? new Date(task.due_date).toISOString().slice(0, 16)
            : '',
          estimated_hours: task.estimated_hours?.toString() || '',
          tags: task.tags?.join(', ') || '',
          progress: task.progress,
        });
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('加载任务数据失败');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, progress: parseInt(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    setSubmitting(true);
    try {
      const tags = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await taskApi.updateTask(Number(id), {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        status: form.status,
        category: form.category,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : undefined,
        tags,
        progress: form.progress,
      });

      toast.success('任务更新成功！');
      router.push(`/tasks/${id}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach((d: any) => toast.error(d.msg));
      } else if (detail) {
        toast.error(String(detail));
      } else {
        toast.error('更新失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head><title>加载中...</title></Head>
        <header className="header">
          <div className="container header-content">
            <span className="logo">任务管理系统</span>
            <Link href="/" className="btn btn-secondary">返回列表</Link>
          </div>
        </header>
        <main className="container"><div className="empty-state"><p>加载中...</p></div></main>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Head><title>任务不存在</title></Head>
        <header className="header">
          <div className="container header-content">
            <span className="logo">任务管理系统</span>
            <Link href="/" className="btn btn-secondary">返回列表</Link>
          </div>
        </header>
        <main className="container">
          <div className="empty-state">
            <h3>任务不存在</h3>
            <Link href="/" className="btn btn-primary">返回仪表盘</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>编辑任务 - 任务管理系统</title>
      </Head>

      <header className="header">
        <div className="container header-content">
          <span className="logo">任务管理系统</span>
          <Link href="/" className="btn btn-secondary">返回列表</Link>
        </div>
      </header>

      <main className="container">
        <div className="breadcrumb">
          <Link href="/">仪表盘</Link>
          <span className="separator">/</span>
          <Link href={`/tasks/${id}`}>{form.title || '任务详情'}</Link>
          <span className="separator">/</span>
          <span>编辑</span>
        </div>

        <div className="form-card">
          <h1 className="form-title">编辑任务</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>任务标题 *</label>
              <input
                className="form-input"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>任务描述</label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>优先级</label>
                <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>状态</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>分类</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>截止日期</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>预计耗时（小时）</label>
                <input
                  className="form-input"
                  type="number"
                  name="estimated_hours"
                  value={form.estimated_hours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>标签（用逗号分隔）</label>
                <input
                  className="form-input"
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>进度：{form.progress}%</label>
              <div className="progress-slider">
                <input
                  type="range"
                  name="progress"
                  value={form.progress}
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                />
                <span className="progress-value">{form.progress}%</span>
              </div>
            </div>

            <div className="form-actions">
              <Link href={`/tasks/${id}`} className="btn btn-secondary">取消</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '保存中...' : '保存变更'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
