export interface ChartData {
  memberGrowth: Array<{ month: string; count: number }>;
  soupConsumption: Array<{ name: string; count: number }>;
  memberActivity: Array<{ name: string; value: number; color: string }>;
  dailyRecords: Array<{ date: string; count: number }>;
  cardTypeDistribution: Array<{ name: string; count: number }>;
} 