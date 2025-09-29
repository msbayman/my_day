"use server"

import axios from "axios"
import { z } from "zod"

const signupSchema = z.object({
   email: z.string().email(),
   username: z.string().min(3),
   password: z.string().min(6),
   confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
   message: "Passwords don't match",
   path: ["confirm_password"],
})

export type SignupFormData = z.infer<typeof signupSchema>

export async function registerUser(data: SignupFormData) {

   const parsed = signupSchema.parse(data)

   try {
      const res = await axios.post("http://localhost:8000/api/user_authentication/register/", {
         email: parsed.email,
         username: parsed.username,
         password: parsed.password,
      })

      return { success: true, data: res.data }
   } catch (error: any) {
      console.error("Register API error:", error.response?.data || error.message)
      return {
         success: false,
         error: error.response?.data || " backend error",
      }
   }
}
