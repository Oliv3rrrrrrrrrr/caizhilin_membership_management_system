// 创建汤品请求
export interface CreateSoupRequest {
  name: string;
  type: string;
}

// 更新汤品请求
export interface UpdateSoupRequest {
  name?: string;
  type?: string;
}

// 汤品响应
export interface SoupResponse {
  id: number;
  name: string;
  type: string;
} 