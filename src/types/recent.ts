// 活动类型
export type ActivityType = 'membership' | 'soup_record';

// 最近活动
export interface RecentActivity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  relatedId?: number; // 相关记录的ID
  relatedType?: string; // 相关记录的类型
  metadata?: {
    memberName?: string;
    soupName?: string;
    cardNumber?: string;
    remainingSoups?: number;
    adminName?: string;
  };
} 