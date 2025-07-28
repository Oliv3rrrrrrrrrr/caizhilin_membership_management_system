import { MembershipResponse, CreateMembershipRequest, UpdateMembershipRequest } from '@/types/membership';

export type MembershipsPageResult = {
  data: MembershipResponse[];
  total: number;
  page: number;
  pageSize: number;
};

// 获取所有会员（分页）
export async function getMemberships(token: string, page: number = 1, pageSize: number = 10): Promise<MembershipsPageResult> {
  const res = await fetch(`/api/memberships?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取会员列表失败');
  return data.data;
}

// 获取所有会员（别名）
export const getAllMemberships = getMemberships;

// 获取单个会员详情
export async function getMembershipById(id: number, token: string): Promise<MembershipResponse> {
  const res = await fetch(`/api/memberships/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取会员详情失败');
  return data.data;
}

// 创建会员
export async function createMembership(membershipData: CreateMembershipRequest, token: string): Promise<MembershipResponse> {
  const res = await fetch('/api/memberships', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(membershipData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '创建会员失败');
  return data.data;
}

// 更新会员
export async function updateMembership(id: number, membershipData: UpdateMembershipRequest, token: string): Promise<MembershipResponse> {
  const res = await fetch(`/api/memberships/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(membershipData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '更新会员失败');
  return data.data;
}

// 删除会员
export async function deleteMembership(id: number, token: string): Promise<void> {
  const res = await fetch(`/api/memberships/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '删除会员失败');
}

// 搜索会员
export async function searchMemberships(query: string, token: string, limit: number = 10): Promise<MembershipResponse[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=members&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '搜索会员失败');
  return data.data.members || [];
} 