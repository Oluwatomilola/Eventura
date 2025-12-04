import { Database } from './types'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

type TableRow<T extends TableName> = Tables[T] extends { Row: infer R } ? R : never
type TableInsert<T extends TableName> = Tables[T] extends { Insert: infer I } ? I : never

export type { TableRow, TableInsert }

// Helper types for common operations
export type Message = TableRow<'messages'>
export type InsertMessage = TableInsert<'messages'>

export type ApiResponse<T = unknown> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
