// 创建会员请求
export interface CreateMembershipRequest {
  name: string;
  phone: string;
  cardType: string;
  remainingSoups: number;
}

// 更新会员请求
export interface UpdateMembershipRequest {
  name?: string;
  phone?: string;
  cardType?: string;
  remainingSoups?: number;
}

// 会员响应
export interface MembershipResponse {
  id: number;
  name: string;
  phone: string;
  cardNumber: string;
  cardType: string;
  issueDate: Date;
  remainingSoups: number;
}

// 通用API响应
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
} 