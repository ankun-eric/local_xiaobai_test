import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { taskApi, Task, TaskStats } from '@/lib/api';
import toast from 'react-hot-toast';

const PRIORITY_LABELS: Record<string, string> = {
  critical: '严重',
  high: '高',
  medium: '中',
  low: '低',
};

const STATUS_LABELS: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  review: '审核中',
  done: '已完成',
};

const CATEGORY_LABELS: Record<string, string> = {
  work: '工作',
  personal: '个人',
  study: '学习',
  health: '健康',
  finance: '财务',
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const pageSize = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        taskApi.getTasks({
          page,
          page_size: pageSize,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          search: search || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        taskApi.getStats(),
      ]);
      setTasks(tasksRes.tasks);
      setTotal(tasksRes.total);
      setStats(statsRes);
    } catch {
      toast.error('加载数据失败，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`确定要删除任务"${title}"吗？此操作不可恢复。`)) return;
    try {
      await taskApi.deleteTask(id);
      toast.success('任务已删除');
      fetchData();
    } catch {
      toast.error('删除失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Head>
        <title>一点都很吹牛逼的管理系统 - 仪表盘</title>
      </Head>

      <header className="header">
        <div className="container header-content">
          <span className="logo">一点都很吹牛逼的管理系统</span>
          <Link href="/tasks/create" className="btn btn-primary">
            + 创建任务
          </Link>
        </div>
      </header>

      <main className="container">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">全部任务</div>
            </div>
            <div className="stat-card todo">
              <div className="stat-value">{stats.todo}</div>
              <div className="stat-label">待办</div>
            </div>
            <div className="stat-card in_progress">
              <div className="stat-value">{stats.in_progress}</div>
              <div className="stat-label">进行中</div>
            </div>
            <div className="stat-card done">
              <div className="stat-value">{stats.done}</div>
              <div className="stat-label">已完成</div>
            </div>
            <div className="stat-card overdue">
              <div className="stat-value">{stats.overdue}</div>
              <div className="stat-label">已逾期</div>
            </div>
          </div>
        )}

        <div className="filter-bar">
          <input
            className="search-input"
            type="text"
            placeholder="搜索任务标题或描述..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">全部状态</option>
            <option value="todo">待办</option>
            <option value="in_progress">进行中</option>
            <option value="review">审核中</option>
            <option value="done">已完成</option>
          </select>
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          >
            <option value="">全部优先级</option>
            <option value="critical">严重</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">创建时间</option>
            <option value="due_date">截止日期</option>
            <option value="priority">优先级</option>
            <option value="title">标题</option>
          </select>
          <select
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>

        <div className="task-table-wrapper">
          {loading ? (
            <div className="empty-state"><p>加载中...</p></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>暂无任务</h3>
              <p>点击右上角「创建任务」按钮添加新任务</p>
              <Link href="/tasks/create" className="btn btn-primary">创建第一个任务</Link>
            </div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>优先级</th>
                  <th>状态</th>
                  <th>分类</th>
                  <th>截止日期</th>
                  <th>进度</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <Link href={`/tasks/${task.id}`} className="task-title-link">
                        {task.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${task.priority}`}>
                        {PRIORITY_LABELS[task.priority] || task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-status-${task.status}`}>
                        {STATUS_LABELS[task.status] || task.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {CATEGORY_LABELS[task.category] || task.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString('zh-CN')
                        : '-'}
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                        {task.progress}%
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link href={`/tasks/${task.id}`} className="btn btn-secondary btn-xs">
                          查看
                        </Link>
                        <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary btn-xs">
                          编辑
                        </Link>
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() => handleDelete(task.id, task.title)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              上一页
            </button>
            <span className="page-info">
              第 {page} / {totalPages} 页（共 {total} 条）
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              下一页
            </button>
          </div>
        )}
      </main>
    </>
  );
}
