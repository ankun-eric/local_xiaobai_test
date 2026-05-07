import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { taskApi } from '@/lib/api';
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

export default function CreateTask() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
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

      await taskApi.createTask({
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

      toast.success('任务创建成功！');
      router.push('/');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach((d: any) => toast.error(d.msg));
      } else if (detail) {
        toast.error(String(detail));
      } else {
        toast.error('创建失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>创建任务 - 牛逼的任务管理系统</title>
      </Head>

      <header className="header">
        <div className="container header-content">
          <span className="logo">牛逼的任务管理系统</span>
          <Link href="/" className="btn btn-secondary">返回列表</Link>
        </div>
      </header>

      <main className="container">
        <div className="form-card">
          <h1 className="form-title">创建新任务</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>任务标题 *</label>
              <input
                className="form-input"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="请输入任务标题"
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
                placeholder="请输入任务详细描述..."
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
                  placeholder="例如：2.5"
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
                  placeholder="例如：紧急, 前端, 设计"
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
              <Link href="/" className="btn btn-secondary">取消</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '创建中...' : '创建任务'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
