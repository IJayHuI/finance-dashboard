/**
 * 财务数据 Store
 * 管理项目、投入记录、资产记录等核心业务数据
 * 数据来源：Supabase 后端数据库
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed, h } from 'vue'
import { createDiscreteApi, NTag, NText, NPopconfirm, NButton, NIcon } from 'naive-ui'
import { ClearRound } from '@vicons/material'
import { supabase } from '../utils/supabase'
import { toDisplay, pnlType } from '../utils/helpers'
import { useSettingsStore } from './settings'

// 使用离散 API 创建消息实例（不需要 n-message-provider）
const { message } = createDiscreteApi(['message'])

export const useFinanceStore = defineStore('finance', () => {
  // ========== 状态 ==========

  /** 项目列表 */
  const projects = ref([])
  /** 投入记录列表 */
  const investments = ref([])
  /** 资产记录列表 */
  const assets = ref([])
  /** 数据加载状态 */
  const loading = ref(true)
  /** 加载错误信息 */
  const loadError = ref('')

  /** 历史趋势图选中的项目 */
  const selectedProjectHistory = ref(null)
  /** 投入记录筛选项目（null=全部） */
  const investFilterProject = ref(null)
  /** 资产记录筛选项目（null=全部） */
  const assetFilterProject = ref(null)

  // ========== 基础查询方法 ==========

  /** 获取项目的币种 */
  function getProjectCurrency(name) {
    const p = projects.value.find(p => p.name === name)
    return p ? p.currency : 'RMB'
  }

  /** 获取项目 ID */
  function getProjectId(name) {
    const p = projects.value.find(p => p.name === name)
    return p ? p.id : null
  }

  /** 计算项目累计本金 */
  function getPrincipal(projectName) {
    return investments.value
      .filter(i => i.project === projectName)
      .reduce((s, i) => s + i.amount, 0)
  }

  /** 获取项目最新资产快照 */
  function getLatestAsset(projectName) {
    const records = assets.value
      .filter(a => a.project === projectName)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    return records.length > 0 ? records[0] : null
  }

  /** 获取项目最新资产日期 */
  function getLatestAssetDate(projectName) {
    const latest = getLatestAsset(projectName)
    return latest ? latest.date : '-'
  }

  // ========== 计算属性 ==========

  const settings = useSettingsStore()

  /** 总资产、总本金、总盈亏等 KPI 数据 */
  const totals = computed(() => {
    let totalAssets = 0
    let totalPrincipal = 0
    projects.value.forEach(p => {
      const principal = getPrincipal(p.name)
      const latest = getLatestAsset(p.name)
      const current = latest ? latest.amount : 0
      totalAssets += toDisplay(current, p.currency, settings.displayCurrency, settings.exchangeRate)
      totalPrincipal += toDisplay(principal, p.currency, settings.displayCurrency, settings.exchangeRate)
    })
    const totalPnL = totalAssets - totalPrincipal
    const totalPnLPct = totalPrincipal !== 0 ? totalPnL / totalPrincipal * 100 : 0
    return { totalAssets, totalPrincipal, totalPnL, totalPnLPct }
  })

  /** KPI 副标题数据（按币种分类） */
  const totalsSub = computed(() => {
    const usdP = projects.value.filter(p => p.currency === 'USD')
    const rmbP = projects.value.filter(p => p.currency === 'RMB')
    const usdAssets = usdP.reduce((s, p) => {
      const l = getLatestAsset(p.name)
      return s + (l ? l.amount : 0)
    }, 0)
    const rmbAssets = rmbP.reduce((s, p) => {
      const l = getLatestAsset(p.name)
      return s + (l ? l.amount : 0)
    }, 0)
    const usdPrinc = usdP.reduce((s, p) => s + getPrincipal(p.name), 0)
    const rmbPrinc = rmbP.reduce((s, p) => s + getPrincipal(p.name), 0)
    return {
      assets: '$' + usdAssets.toFixed(2) + ' + ¥' + rmbAssets.toFixed(2),
      principal: '$' + usdPrinc.toFixed(2) + ' + ¥' + rmbPrinc.toFixed(2),
      pnl: '共 ' + projects.value.length + ' 个项目',
      rate: '基于汇率 ' + settings.exchangeRate.toFixed(4),
    }
  })

  /** 项目明细表数据 */
  const projectTableData = computed(() => {
    return projects.value.map(p => {
      const principal = getPrincipal(p.name)
      const latest = getLatestAsset(p.name)
      const current = latest ? latest.amount : 0
      const pnl = current - principal
      const pnlPct = principal !== 0 ? pnl / principal * 100 : 0
      const statusType = pnl > 0 ? 'success' : pnl < 0 ? 'error' : 'default'
      return {
        name: p.name,
        currency: p.currency,
        principal: fmtLocal(principal, p.currency),
        current: fmtLocal(current, p.currency),
        pnl: (pnl >= 0 ? '+' : '') + fmtLocal(pnl, p.currency),
        pnlRaw: pnl,
        pnlPct: (pnlPct > 0 ? '+' : '') + pnlPct.toFixed(2) + '%',
        pnlPctRaw: pnlPct,
        latestDate: getLatestAssetDate(p.name),
        status: pnl > 0 ? '盈利' : pnl < 0 ? '亏损' : '持平',
        statusType,
      }
    })
  })

  // 本地格式化辅助（用 settings 中的汇率和币种）
  function fmtLocal(amount, currency) {
    const v = toDisplay(amount, currency, settings.displayCurrency, settings.exchangeRate)
    const sym = settings.displayCurrency === 'RMB' ? '¥' : '$'
    const sign = v < 0 ? '-' : ''
    return sign + sym + Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  /** 项目下拉选项 */
  const projectOptions = computed(() =>
    projects.value.map(p => ({ label: p.name + ' (' + p.currency + ')', value: p.name }))
  )

  /** 筛选下拉选项（含"全部项目"） */
  const filterOptions = computed(() => [
    { label: '全部项目', value: null },
    ...projectOptions.value
  ])

  /** 资产更新下拉选项（带当前金额提示） */
  const assetProjectOptions = computed(() =>
    projects.value.map(p => {
      const latest = getLatestAsset(p.name)
      const cv = latest ? latest.amount : 0
      return { label: p.name + ' (' + p.currency + ') — 当前: ' + cv, value: p.name }
    })
  )

  /** 投入记录（首页前10条） */
  const investTableData = computed(() => {
    const filtered = investFilterProject.value
      ? investments.value.filter(r => r.project === investFilterProject.value)
      : investments.value
    return [...filtered]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        date: r.date,
        project: r.project,
        amount: (r.amount >= 0 ? '+' : '') + fmtLocal(r.amount, getProjectCurrency(r.project)),
        amountRaw: r.amount,
        type: r.amount >= 0 ? '投入' : '减少',
        typeType: r.amount >= 0 ? 'success' : 'error',
      }))
  })

  /** 投入记录（全部，用于抽屉） */
  const allInvestTableData = computed(() => {
    const filtered = investFilterProject.value
      ? investments.value.filter(r => r.project === investFilterProject.value)
      : investments.value
    return [...filtered]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(r => ({
        id: r.id,
        date: r.date,
        project: r.project,
        amount: (r.amount >= 0 ? '+' : '') + fmtLocal(r.amount, getProjectCurrency(r.project)),
        amountRaw: r.amount,
        type: r.amount >= 0 ? '投入' : '减少',
        typeType: r.amount >= 0 ? 'success' : 'error',
      }))
  })

  /** 投入记录总数（受筛选影响） */
  const investTotalCount = computed(() =>
    investFilterProject.value
      ? investments.value.filter(r => r.project === investFilterProject.value).length
      : investments.value.length
  )

  /** 资产记录（首页前10条） */
  const assetTableData = computed(() => {
    const filtered = assetFilterProject.value
      ? assets.value.filter(r => r.project === assetFilterProject.value)
      : assets.value
    return [...filtered]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        date: r.date,
        project: r.project,
        amount: fmtLocal(r.amount, getProjectCurrency(r.project)),
      }))
  })

  /** 资产记录（全部，用于抽屉） */
  const allAssetTableData = computed(() => {
    const filtered = assetFilterProject.value
      ? assets.value.filter(r => r.project === assetFilterProject.value)
      : assets.value
    return [...filtered]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(r => ({
        id: r.id,
        date: r.date,
        project: r.project,
        amount: fmtLocal(r.amount, getProjectCurrency(r.project)),
      }))
  })

  /** 资产记录总数（受筛选影响） */
  const assetTotalCount = computed(() =>
    assetFilterProject.value
      ? assets.value.filter(r => r.project === assetFilterProject.value).length
      : assets.value.length
  )

  /** 项目管理列表数据 */
  const projectManageList = computed(() =>
    projects.value.map(p => {
      const principal = getPrincipal(p.name)
      const latest = getLatestAsset(p.name)
      const current = latest ? latest.amount : 0
      return {
        name: p.name,
        currency: p.currency,
        principal: fmtLocal(principal, p.currency),
        current: fmtLocal(current, p.currency),
      }
    })
  )

  // ========== 数据加载 ==========

  /** 从 Supabase 加载全部数据（内部实现，不含 loading 状态） */
  async function fetchAllData() {
    // 并行加载三张表
    const [{ data: pData, error: pe }, { data: iData, error: ie }, { data: aData, error: ae }] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('investments').select('*').order('date'),
      supabase.from('assets').select('*').order('date'),
    ])
    if (pe || ie || ae) throw new Error(pe?.message || ie?.message || ae?.message)

    // 建立 project_id -> name 的映射
    const projectMap = {}
    pData.forEach(p => { projectMap[p.id] = p })

    projects.value = pData.map(p => ({ id: p.id, name: p.name, currency: p.currency }))
    investments.value = iData.map(r => ({
      id: r.id,
      date: r.date,
      amount: parseFloat(r.amount),
      project: projectMap[r.project_id]?.name || '?',
    }))
    assets.value = aData.map(r => ({
      id: r.id,
      date: r.date,
      amount: parseFloat(r.amount),
      project: projectMap[r.project_id]?.name || '?',
    }))

    // 默认选中第一个项目用于历史趋势图
    if (projects.value.length > 0 && !selectedProjectHistory.value) {
      selectedProjectHistory.value = projects.value[0].name
    }
  }

  /** 从 Supabase 加载全部数据（首次加载，显示 loading） */
  async function loadData() {
    loading.value = true
    loadError.value = ''
    try {
      await fetchAllData()
    } catch (err) {
      loadError.value = err.message || '数据加载失败'
      message.error('数据加载失败: ' + loadError.value)
    } finally {
      loading.value = false
    }
  }

  /** 刷新数据（操作后调用，不显示 loading，不触发页面重载感） */
  async function refreshData() {
    try {
      await fetchAllData()
    } catch (err) {
      message.error('数据刷新失败: ' + err.message)
    }
  }

  // ========== 项目 CRUD ==========

  /** 添加新项目 */
  async function addProject(name, currency) {
    if (!name?.trim()) { message.error('请输入项目名称'); return false }
    if (projects.value.find(p => p.name === name.trim())) { message.error('项目已存在'); return false }
    try {
      const maxOrder = projects.value.reduce((m, p) => Math.max(m, p.sort_order || 0), 0)
      const { error } = await supabase.from('projects').insert({
        name: name.trim(),
        currency,
        sort_order: maxOrder + 1,
      })
      if (error) throw error
      await refreshData()
      message.success('项目 "' + name.trim() + '" 已添加')
      return true
    } catch (err) {
      message.error('添加失败: ' + err.message)
      return false
    }
  }

  /** 切换项目币种 */
  async function editProjectCurrency(name) {
    const p = projects.value.find(p => p.name === name)
    if (!p) return false
    const newCurr = p.currency === 'USD' ? 'RMB' : 'USD'
    try {
      const { error } = await supabase.from('projects').update({ currency: newCurr }).eq('id', p.id)
      if (error) throw error
      await refreshData()
      message.success('"' + name + '" 币种已切换为 ' + newCurr)
      return true
    } catch (err) {
      message.error('切换失败: ' + err.message)
      return false
    }
  }

  /** 删除项目（级联删除关联记录） */
  async function deleteProject(name) {
    const p = projects.value.find(p => p.name === name)
    if (!p) return false
    try {
      const { error } = await supabase.from('projects').delete().eq('id', p.id)
      if (error) throw error
      if (selectedProjectHistory.value === name) selectedProjectHistory.value = null
      await refreshData()
      message.success('项目 "' + name + '" 已删除')
      return true
    } catch (err) {
      message.error('删除失败: ' + err.message)
      return false
    }
  }

  // ========== 投入记录 CRUD ==========

  /** 添加投入/减少本金记录 */
  async function addInvest(dateStr, project, amount) {
    if (!dateStr || !project || amount === null) { message.error('请填写完整信息'); return false }
    const projectId = getProjectId(project)
    if (!projectId) { message.error('项目不存在'); return false }
    try {
      const { error } = await supabase.from('investments').insert({
        project_id: projectId,
        date: dateStr,
        amount: Math.round(amount * 100) / 100,
      })
      if (error) throw error
      await refreshData()
      const type = amount >= 0 ? '投入本金' : '减少本金'
      message.success(type + ' -> ' + project)
      return true
    } catch (err) {
      message.error('操作失败: ' + err.message)
      return false
    }
  }

  /** 删除投入记录 */
  async function deleteInvest(id) {
    try {
      const { error } = await supabase.from('investments').delete().eq('id', id)
      if (error) throw error
      await refreshData()
      message.success('投入记录已删除')
      return true
    } catch (err) {
      message.error('删除失败: ' + err.message)
      return false
    }
  }

  // ========== 资产记录 CRUD ==========

  /** 更新项目金额（同日同项目自动覆盖） */
  async function updateAsset(dateStr, project, amount) {
    if (!dateStr || !project || amount === null) { message.error('请填写完整信息'); return false }
    const projectId = getProjectId(project)
    if (!projectId) { message.error('项目不存在'); return false }
    try {
      const { error } = await supabase.from('assets').upsert(
        { project_id: projectId, date: dateStr, amount: Math.round(amount * 100) / 100 },
        { onConflict: 'project_id,date' }
      )
      if (error) throw error
      await refreshData()
      message.success('已更新 ' + project + ' 金额')
      return true
    } catch (err) {
      message.error('操作失败: ' + err.message)
      return false
    }
  }

  /** 删除资产记录 */
  async function deleteAsset(id) {
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id)
      if (error) throw error
      await refreshData()
      message.success('资产记录已删除')
      return true
    } catch (err) {
      message.error('删除失败: ' + err.message)
      return false
    }
  }

  // ========== 表格列定义 ==========

  /** 投入记录表列定义 */
  const investColumns = computed(() => {
    const cols = [
      { title: '日期', key: 'date', width: 110 },
      { title: '项目', key: 'project', width: 100 },
      {
        title: '金额', key: 'amount',
        render: row => h(NText, { type: pnlType(row.amountRaw) }, { default: () => row.amount })
      },
      {
        title: '类型', key: 'type', width: 70,
        render: row => h(NTag, { type: row.typeType, size: 'small', bordered: false }, { default: () => row.type })
      },
    ]
    // 编辑模式下才显示删除按钮
    if (settings.isEditing) {
      cols.push({
        title: '', key: 'actions', width: 50,
        render: row => h(NPopconfirm, { onPositiveClick: () => deleteInvest(row.id) }, {
          trigger: () => h(NButton, { size: 'tiny', secondary: true, type: 'error', circle: true, renderIcon: () => h(NIcon, { size: 14 }, { default: () => h(ClearRound) }) }, {}),
          default: () => '删除这条记录？'
        })
      })
    }
    return cols
  })

  /** 资产记录表列定义 */
  const assetColumns = computed(() => {
    const cols = [
      { title: '日期', key: 'date', width: 110 },
      { title: '项目', key: 'project', width: 100 },
      { title: '金额', key: 'amount' },
    ]
    // 编辑模式下才显示删除按钮
    if (settings.isEditing) {
      cols.push({
        title: '', key: 'actions', width: 50,
        render: row => h(NPopconfirm, { onPositiveClick: () => deleteAsset(row.id) }, {
          trigger: () => h(NButton, { size: 'tiny', secondary: true, type: 'error', circle: true, renderIcon: () => h(NIcon, { size: 14 }, { default: () => h(ClearRound) }) }, {}),
          default: () => '删除这条记录？'
        })
      })
    }
    return cols
  })

  return {
    // 状态
    projects, investments, assets,
    loading, loadError,
    selectedProjectHistory, investFilterProject, assetFilterProject,
    // 方法
    loadData, refreshData,
    getProjectCurrency, getPrincipal, getLatestAsset,
    addProject, editProjectCurrency, deleteProject,
    addInvest, deleteInvest, updateAsset, deleteAsset,
    // 计算属性
    totals, totalsSub, projectTableData,
    projectOptions, filterOptions, assetProjectOptions,
    investTableData, allInvestTableData, investTotalCount,
    assetTableData, allAssetTableData, assetTotalCount,
    projectManageList,
    investColumns, assetColumns,
  }
})
