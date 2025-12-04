import { createServerClient } from './server'
import type { Message, InsertMessage } from './api.types'

const db = {
  // Message operations
  messages: {
    async getById(id: string): Promise<Message | null> {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching message:', error)
        return null
      }

      return data
    },

    async markAsRead(id: string): Promise<Message | null> {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error marking message as read:', error)
        return null
      }

      return data
    },

    async create(message: Omit<InsertMessage, 'id' | 'created_at'>): Promise<Message | null> {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating message:', error)
        return null
      }

      return data
    },
  },
}

export { db }
