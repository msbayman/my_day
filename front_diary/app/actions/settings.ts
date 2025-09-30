"use server"

import axios from "axios"
import { z } from "zod"
import { cookies } from 'next/headers'
const settingsSchema = z.object({
   email: z.string().email("Invalid email address"), // ✅ Add email field
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
      const cookieStore = await cookies()
      const token = cookieStore.get('access_token')?.value

      const res = await axios.post("http://localhost:8000/api/user_authentication/settings/", {
         username: parsed.username || undefined,
         new_password: parsed.newPassword || undefined,
         two_fa: parsed.twoFA,
         current_password: parsed.currentPassword,
      },
      { headers: {
            Authorization: `Bearer ${token}`,
         },
      }
   )

      return { success: true, data: res.data }
   } catch (error: any) {
      console.error("Settings API error:", error.response?.data || error.message)
      return {
         success: false,
         error: error.response?.data || " backend error",
      }
   }
}