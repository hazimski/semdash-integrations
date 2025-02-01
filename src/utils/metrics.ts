export interface OrganicMetrics {
  pos_1: number;
  pos_2_3: number;
  pos_4_10: number;
  pos_11_20: number;
  pos_21_30: number;
  pos_31_40: number;
  pos_41_50: number;
  pos_51_60: number;
  pos_61_70: number;
  pos_71_80: number;
  pos_81_90: number;
  pos_91_100: number;
}

export function aggregateOrganicMetrics(items: Array<{ metrics: { organic: OrganicMetrics } }>): OrganicMetrics {
  const initialMetrics: OrganicMetrics = {
    pos_1: 0,
    pos_2_3: 0,
    pos_4_10: 0,
    pos_11_20: 0,
    pos_21_30: 0,
    pos_31_40: 0,
    pos_41_50: 0,
    pos_51_60: 0,
    pos_61_70: 0,
    pos_71_80: 0,
    pos_81_90: 0,
    pos_91_100: 0
  };

  return items.reduce((acc, item) => {
    const metrics = item.metrics.organic;
    return {
      pos_1: acc.pos_1 + (metrics.pos_1 || 0),
      pos_2_3: acc.pos_2_3 + (metrics.pos_2_3 || 0),
      pos_4_10: acc.pos_4_10 + (metrics.pos_4_10 || 0),
      pos_11_20: acc.pos_11_20 + (metrics.pos_11_20 || 0),
      pos_21_30: acc.pos_21_30 + (metrics.pos_21_30 || 0),
      pos_31_40: acc.pos_31_40 + (metrics.pos_31_40 || 0),
      pos_41_50: acc.pos_41_50 + (metrics.pos_41_50 || 0),
      pos_51_60: acc.pos_51_60 + (metrics.pos_51_60 || 0),
      pos_61_70: acc.pos_61_70 + (metrics.pos_61_70 || 0),
      pos_71_80: acc.pos_71_80 + (metrics.pos_71_80 || 0),
      pos_81_90: acc.pos_81_90 + (metrics.pos_81_90 || 0),
      pos_91_100: acc.pos_91_100 + (metrics.pos_91_100 || 0)
    };
  }, initialMetrics);
}
