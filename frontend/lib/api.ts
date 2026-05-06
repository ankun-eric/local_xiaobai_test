import axios from 'axios';

const api = axios.create({
  baseURL: '/autodev/a46094c5-4cff-434b-a815-3e73fc6d39a6/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  category: string;
  due_date: string | null;
  estimated_hours: number | null;
  tags: string[];
  progress: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  category?: string;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
  progress?: number;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  category?: string;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
  progress?: number;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  overdue: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

export const taskApi = {
  getStats: () => api.get<TaskStats>('/tasks/stats').then((r) => r.data),

  getTasks: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) => api.get<TaskListResponse>('/tasks', { params }).then((r) => r.data),

  getTask: (id: number) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  createTask: (data: TaskCreateData) =>
    api.post<Task>('/tasks', data).then((r) => r.data),

  updateTask: (id: number, data: TaskUpdateData) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),

  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

export default api;
