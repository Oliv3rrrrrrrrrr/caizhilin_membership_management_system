// 通用错误类型
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 通用响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 搜索响应类型
export interface SearchResponse<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 表单错误类型
export interface FormErrors {
  [key: string]: string;
}

// 加载状态类型
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// 通用状态类型
export interface State<T> extends LoadingState {
  data: T | null;
} 