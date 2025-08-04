import { ChartData } from '@/types/chart';
const API_BASE_URL = '/api/charts';

// 获取图表数据
export async function getChartData(token: string): Promise<ChartData> {
  const response = await fetch(API_BASE_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取图表数据失败');
  }

  const result = await response.json();
  return result.data;
}

// 获取会员增长数据
export async function getMemberGrowthData(token: string) {
  const response = await fetch(`${API_BASE_URL}?type=memberGrowth`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取会员增长数据失败');
  }

  const result = await response.json();
  return result.data;
}

// 获取每日记录数据
export async function getDailyRecordsData(token: string) {
  const response = await fetch(`${API_BASE_URL}?type=dailyRecords`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取每日记录数据失败');
  }

  const result = await response.json();
  return result.data;
}

// 获取会员活跃度数据
export async function getMemberActivityData(token: string) {
  const response = await fetch(`${API_BASE_URL}?type=memberActivity`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取会员活跃度数据失败');
  }

  const result = await response.json();
  return result.data;
}

// 获取卡类型分布数据
export async function getCardTypeDistributionData(token: string) {
  const response = await fetch(`${API_BASE_URL}?type=cardTypeDistribution`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取卡类型分布数据失败');
  }

  const result = await response.json();
  return result.data;
}

// 获取汤品消费数据
export async function getSoupConsumptionData(token: string) {
  const response = await fetch(`${API_BASE_URL}?type=soupConsumption`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('获取汤品消费数据失败');
  }

  const result = await response.json();
  return result.data;
} 