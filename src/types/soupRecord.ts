// 创建喝汤记录请求
export interface CreateSoupRecordRequest {
  membershipId: number;
  soupId: number;
  drinkTime?: string;
}

// 更新喝汤记录请求
export interface UpdateSoupRecordRequest {
  soupId?: number;
  drinkTime?: string;
}

// 喝汤记录响应
export interface SoupRecordResponse {
  id: number;
  drinkTime: string;
  membershipId: number;
  soupId: number;
  membership: {
    id: number;
    name: string;
    phone: string;
    cardNumber: string;
    cardType: string;
  };
  soup: {
    id: number;
    name: string;
    type: string;
  };
}

// 喝汤记录详情响应
export interface SoupRecordWithDetailsResponse {
  id: number;
  drinkTime: string;
  membership: {
    id: number;
    name: string;
    phone: string;
    cardNumber: string;
    cardType: string;
    remainingSoups: number;
  };
  soup: {
    id: number;
    name: string;
    type: string;
  };
} 