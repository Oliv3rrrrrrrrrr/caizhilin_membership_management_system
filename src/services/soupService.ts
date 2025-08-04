import { SoupResponse, CreateSoupRequest, UpdateSoupRequest } from '@/types/soup';

// 获取所有汤品
export async function getAllSoups(token: string): Promise<SoupResponse[]> {
  const res = await fetch('/api/soup', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取汤品列表失败');
  return data.data;
}

// 获取单个汤品详情
export async function getSoupById(id: number, token: string): Promise<SoupResponse> {
  const res = await fetch(`/api/soup/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取汤品详情失败');
  return data.data;
}

// 创建汤品
export async function createSoup(soupData: CreateSoupRequest, token: string): Promise<SoupResponse> {
  const res = await fetch('/api/soup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(soupData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '创建汤品失败');
  return data.data;
}

// 更新汤品
export async function updateSoup(id: number, soupData: UpdateSoupRequest, token: string): Promise<SoupResponse> {
  const res = await fetch(`/api/soup/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(soupData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '更新汤品失败');
  return data.data;
}

// 删除汤品
export async function deleteSoup(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/soup/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '删除汤品失败');
}

// 搜索汤品
export async function searchSoups(query: string, token: string, limit: number = 10): Promise<SoupResponse[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=soups&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '搜索汤品失败');
  return data.data.soups || [];
} 