"use server"

import axios from "axios"
import { z } from "zod"
import { cookies } from 'next/headers'

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
      const cookieStore = await cookies() 

      if (res.data.access && res.data.refresh) {
         cookieStore.set('access_token', res.data.access, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7 // 7 days
         })

         cookieStore.set('refresh_token', res.data.refresh, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30 // 30 days
         })
      }

      return { success: true, data: res.data }
   } catch (error: any) {
      console.error("Login API error:", error.response?.data || error.message)
      return {
         success: false,
         error: error.response?.data || { message: "Backend error" },
      }
   }
}