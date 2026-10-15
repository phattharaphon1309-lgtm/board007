import { User, Thread, Comment, RoomCategory, Report, AuditLog, AdminStats } from '../types';

const TOKEN_KEY = 'punx_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: {
    username: string;
    displayName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    citizenId?: string;
    bio?: string;
  }): Promise<{ message: string; token: string; user: User }> {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },

  async login(payload: { loginId: string; password: string }): Promise<{ message: string; token: string; user: User }> {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },

  async loginWithFirebase(payload: {
    email: string;
    displayName?: string | null;
    photoUrl?: string | null;
    uid: string;
  }): Promise<{ message: string; token: string; user: User }> {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  async updateProfile(payload: {
    displayName?: string;
    bio?: string;
    phoneNumber?: string;
    avatar?: string;
  }): Promise<{ message: string; user: User }> {
    return request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getDemoAccounts(): Promise<Array<{
    username: string;
    role: 'user' | 'admin';
    displayName: string;
    description: string;
    passwordPlain: string;
  }>> {
    return request('/api/auth/demo-accounts');
  },

  // Rooms & Threads
  async getRooms(): Promise<RoomCategory[]> {
    return request<RoomCategory[]>('/api/threads/rooms');
  },

  async getThreads(params: {
    room?: string;
    tag?: string;
    sort?: string;
    search?: string;
    authorId?: string;
  } = {}): Promise<Thread[]> {
    const query = new URLSearchParams();
    if (params.room) query.append('room', params.room);
    if (params.tag) query.append('tag', params.tag);
    if (params.sort) query.append('sort', params.sort);
    if (params.search) query.append('search', params.search);
    if (params.authorId) query.append('authorId', params.authorId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Thread[]>(`/api/threads${qs}`);
  },

  async getThread(id: string): Promise<{ thread: Thread; comments: Comment[] }> {
    return request<{ thread: Thread; comments: Comment[] }>(`/api/threads/${id}`);
  },

  async createThread(payload: {
    title: string;
    content: string;
    room: string;
    threadType?: string;
    tags?: string[];
    imageUrl?: string;
  }): Promise<{ message: string; thread: Thread }> {
    return request<{ message: string; thread: Thread }>('/api/threads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateThread(id: string, payload: {
    title?: string;
    content?: string;
    room?: string;
    threadType?: string;
    tags?: string[];
    imageUrl?: string;
  }): Promise<{ message: string; thread: Thread }> {
    return request<{ message: string; thread: Thread }>(`/api/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteThread(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/threads/${id}`, {
      method: 'DELETE',
    });
  },

  async addComment(threadId: string, payload: {
    content: string;
    imageUrl?: string;
    pantipEmotion?: string;
  }): Promise<{ message: string; comment: Comment }> {
    return request<{ message: string; comment: Comment }>(`/api/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteComment(commentId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/threads/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async reactThread(id: string, payload: {
    emotion?: string;
    type?: 'emotion' | 'repost' | 'bookmark';
  }): Promise<{ message: string; thread: Thread }> {
    return request<{ message: string; thread: Thread }>(`/api/threads/${id}/react`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async reportThread(id: string, reason: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/threads/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/api/admin/stats');
  },

  async getAdminUsers(unmask = false): Promise<User[]> {
    return request<User[]>(`/api/admin/users?unmask=${unmask}`);
  },

  async setAdminUserRole(userId: string, role: 'user' | 'admin'): Promise<{ message: string; user: User }> {
    return request<{ message: string; user: User }>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async setAdminUserStatus(userId: string, isSuspended: boolean): Promise<{ message: string; user: User }> {
    return request<{ message: string; user: User }>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isSuspended }),
    });
  },

  async adminPinThread(threadId: string): Promise<{ message: string; isPinned: boolean }> {
    return request<{ message: string; isPinned: boolean }>(`/api/admin/threads/${threadId}/pin`, {
      method: 'POST',
    });
  },

  async adminLockThread(threadId: string): Promise<{ message: string; isLocked: boolean }> {
    return request<{ message: string; isLocked: boolean }>(`/api/admin/threads/${threadId}/lock`, {
      method: 'POST',
    });
  },

  async getAdminReports(): Promise<Report[]> {
    return request<Report[]>('/api/admin/reports');
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<{ message: string; report: Report }> {
    return request<{ message: string; report: Report }>(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/api/admin/audit-logs');
  },
};
