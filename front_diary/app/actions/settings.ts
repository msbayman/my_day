"use server"

import { z } from "zod"
import apiServer from '@/lib/api-server'

const settingsSchema = z.object({
   username: z.string().min(3, "Username must be at least 3 characters").optional()
      .or(z.literal("")),
   newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
   twoFA: z.boolean().optional(),
   currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

export async function updateSettings(data: SettingsFormData) {
   const parsed = settingsSchema.parse(data)

   try {
      const res = await apiServer.post("/user_authentication/settings/", {
         username: parsed.username || undefined,
         new_password: parsed.newPassword || undefined,
         two_fa: parsed.twoFA,
         current_password: parsed.currentPassword,
      })

      return { success: true, data: res.data }
   } catch (error: any) {
      console.error("Settings API error:", error.response?.data || error.message)
      return {
         success: false,
         error: error.response?.data || " backend error",
      }
   }
}