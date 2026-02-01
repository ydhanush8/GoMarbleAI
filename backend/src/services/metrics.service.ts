/**
 * Calculate Click-Through Rate (CTR)
 * CTR = (Clicks / Impressions) * 100
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

/**
 * Calculate Cost Per Click (CPC)
 * CPC = Spend / Clicks
 */
export function calculateCPC(spend: number | any, clicks: number): number {
  if (clicks === 0) return 0;
  const spendNum = typeof spend === 'number' ? spend : parseFloat(spend.toString());
  return spendNum / clicks;
}

/**
 * Calculate Cost Per Acquisition (CPA)
 * CPA = Spend / Conversions
 */
export function calculateCPA(spend: number | any, conversions: number): number {
  if (conversions === 0) return 0;
  const spendNum = typeof spend === 'number' ? spend : parseFloat(spend.toString());
  return spendNum / conversions;
}

/**
 * Calculate Return on Ad Spend (ROAS)
 * ROAS = Conversion Value / Spend
 */
export function calculateROAS(conversionValue: number | any, spend: number | any): number {
  if (spend === 0 || typeof spend === 'object' && parseFloat(spend.toString()) === 0) return 0;
  const valueNum = typeof conversionValue === 'number' ? conversionValue : parseFloat(conversionValue.toString());
  const spendNum = typeof spend === 'number' ? spend : parseFloat(spend.toString());
  return valueNum / spendNum;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Convert Decimal to number safely
 */
export function decimalToNumber(value: any): number {
  return parseFloat(value.toString());
}
