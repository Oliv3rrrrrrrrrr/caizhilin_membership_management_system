import { SoupRecordResponse, CreateSoupRecordRequest, UpdateSoupRecordRequest, SoupRecordWithDetailsResponse } from '@/types/soupRecord';

export type SoupRecordsPageResult = {
  data: SoupRecordResponse[];
  total: number;
  page: number;
  pageSize: number;
};

// 获取所有喝汤记录（分页）
export async function getSoupRecords(token: string, page: number = 1, pageSize: number = 10): Promise<SoupRecordsPageResult> {
  const res = await fetch(`/api/soup-record?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取喝汤记录失败');
  return data.data;
}

// 获取单个喝汤记录详情
export async function getSoupRecordById(id: number, token: string): Promise<SoupRecordWithDetailsResponse> {
  const res = await fetch(`/api/soup-record/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取喝汤记录详情失败');
  return data.data;
}

// 根据会员ID获取喝汤记录（分页）
export async function getSoupRecordsByMembershipId(membershipId: number, token: string, page: number = 1, pageSize: number = 10): Promise<SoupRecordsPageResult> {
  const res = await fetch(`/api/soup-record?membershipId=${membershipId}&page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取喝汤记录失败');
  return data.data;
}

// 创建喝汤记录
export async function createSoupRecord(soupRecordData: CreateSoupRecordRequest, token: string): Promise<SoupRecordResponse> {
  const res = await fetch('/api/soup-record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(soupRecordData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '创建喝汤记录失败');
  return data.data;
}

// 更新喝汤记录
export async function updateSoupRecord(id: number, soupRecordData: UpdateSoupRecordRequest, token: string): Promise<SoupRecordResponse> {
  const res = await fetch(`/api/soup-record/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(soupRecordData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '更新喝汤记录失败');
  return data.data;
}

// 删除喝汤记录
export async function deleteSoupRecord(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/soup-record/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '删除喝汤记录失败');
}

// 获取喝汤记录统计信息
export async function getSoupRecordStats(token: string): Promise<{ total: number; today: number; week: number; uniqueMembers: number }> {
  const res = await fetch('/api/soup-records/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取喝汤记录统计信息失败');
  return data.data;
}

// 搜索喝汤记录（分页）
export async function searchSoupRecords(query: string, token: string, page: number = 1, pageSize: number = 10): Promise<{ records: any[]; total: number; page: number; pageSize: number }> {
  const res = await fetch(`/api/soup-records/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '搜索喝汤记录失败');
  return data.data;
} 