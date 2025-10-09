"use server"
import apiServer from "@/lib/api-server"

export async function getAllTodos(date?: string) {
   console.log("Fetching todos for date:", date)
   try {
      const res = await apiServer.get("/Diary_todo/get_all_todos/", {
         params: { date },
      })
      return res.data
   } catch (error: any) {
      console.error("Error fetching todos:", error.response?.data || error.message)
      throw error
   }
}

export async function deleteTodo(id: number) {
   console.log("Deleting todo:", id)
   try {
      const res = await apiServer.delete(`/Diary_todo/delete_todo/${id}/`)
      return res.status === 204 || res.status === 200
   } catch (error: any) {
      console.error("Error deleting todo:", error.response?.data || error.message)
      throw error
   }
}
