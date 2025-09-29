"use server"

import axios from "axios"
import { z } from "zod"

const loginSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export async function loginUser(data: LoginFormData) {
   try {
      const parsed = loginSchema.parse(data)

      const res = await axios.post("http://localhost:8000/api/user_authentication/login/", {
         email: parsed.email,
         password: parsed.password,
      })

      return { success: true, data: res.data }
   } catch (error: any) {
      console.error("Login API error:", error.response?.data || error.message)
      return {
         success: false,
         error: error.response?.data || { message: "Backend error" },
      }
   }
}