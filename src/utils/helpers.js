/**
 * 全局工具函数
 * 提供格式化、计算等通用工具方法
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {number|Date} ts - 时间戳或 Date 对象
 * @returns {string} 格式化后的日期字符串
 */
export function fmtDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toISOString().slice(0, 10)
}

/**
 * 金额格式化（根据显示货币转换并格式化）
 * @param {number} amount - 原始金额
 * @param {string} fromCurrency - 原始币种 'USD' | 'RMB'
 * @param {string} displayCurrency - 显示币种 'USD' | 'RMB'
 * @param {number} exchangeRate - 汇率（1 USD = ? RMB）
 * @returns {string} 带符号的格式化金额
 */
export function fmtMoney(amount, fromCurrency, displayCurrency, exchangeRate) {
  const v = toDisplay(amount, fromCurrency, displayCurrency, exchangeRate)
  const sym = displayCurrency === 'RMB' ? '¥' : '$'
  const sign = v < 0 ? '-' : ''
  return sign + sym + Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 将金额转换为显示货币
 * @param {number} amount - 原始金额
 * @param {string} fromCurrency - 原始币种
 * @param {string} displayCurrency - 目标币种
 * @param {number} exchangeRate - 汇率
 * @returns {number} 转换后的金额
 */
export function toDisplay(amount, fromCurrency, displayCurrency, exchangeRate) {
  if (fromCurrency === displayCurrency) return amount
  if (fromCurrency === 'USD' && displayCurrency === 'RMB') return amount * exchangeRate
  if (fromCurrency === 'RMB' && displayCurrency === 'USD') return amount / exchangeRate
  return amount
}

/**
 * 百分比格式化（自动添加正负号）
 * @param {number} v - 百分比数值
 * @returns {string} 格式化后的百分比
 */
export function fmtPct(v) {
  return (v > 0 ? '+' : '') + v.toFixed(2) + '%'
}

/**
 * 根据数值返回 Naive UI 文本类型（用于盈亏着色）
 * @param {number} v - 数值
 * @returns {string} 'success' | 'error' | 'default'
 */
export function pnlType(v) {
  return v > 0 ? 'success' : v < 0 ? 'error' : 'default'
}

/**
 * 图表配色（8 种高区分度颜色）
 */
export const CHART_COLORS = [
  '#18a058', '#d03050', '#2080f0', '#f0a020',
  '#7c3aed', '#0ea5e9', '#10b981', '#ec4899'
]
