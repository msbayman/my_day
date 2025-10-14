'use server'

import apiServer from "@/lib/api-server"

export async function getDiaryByDate(date?: string) {
   const response = await apiServer.get("/Diary_todo/get_diary_by_date", { params: { date } })
   return response.data
}

export async function saveDiary(data: { date: string; content: string }) {
   const response = await apiServer.post("/Diary_todo/save_or_update_diary/", data)
   return response.data
}
