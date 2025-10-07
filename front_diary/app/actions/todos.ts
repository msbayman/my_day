"use server"
import apiServer from '@/lib/api-server'

export async function getAllTodos() {
   try {
      const res = await apiServer.get("/Diary_todo/get_all_todos/")
      console.log(res)
      return res.data // ✅ Return data directly
   } catch (error: any) {
      console.error("Settings API error:", error.response?.data || error.message)
      throw error // ✅ Throw error to be caught in component
   }
}