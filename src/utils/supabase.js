/**
 * Supabase 客户端配置
 * 从环境变量读取 URL 和匿名 key，创建全局可用的 Supabase 客户端实例
 */
import { createClient } from '@supabase/supabase-js'

// Supabase 项目 URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Supabase 匿名公钥（可安全暴露在前端，配合 RLS 使用）
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建并导出 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
