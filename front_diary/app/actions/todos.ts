"use server"
import apiServer from '@/lib/api-server'

export async function getAllTodos(data?: string) {
   console.log("Fetching todos for date:", data)
   try {
      const res = await apiServer.get("/Diary_todo/get_all_todos/", {
         params: { date: data }
      })
      return res.data 
   } catch (error: any) {
      console.error("Settings API error:", error.response?.data || error.message)
      throw error
   }
}