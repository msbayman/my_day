"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import styles from "../../styles/pages/register.module.css"
import { redirect } from 'next/navigation';
import { registerUser } from "@/app/actions/register"  // ✅ import server action

// ✅ client-side zod schema for RHF
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type SignupFormData = z.infer<typeof signupSchema>

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    console.log("Form submitted:", data)

    const res = await registerUser(data) // ✅ calls server function

    if (res.success) {
      redirect('/routes/login')
    } else {
      console.error("Registration failed ❌", res.error)
      alert("Registration failed: " + JSON.stringify(res.error))
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full">
      <div className="absolute inset-0 bg-[url(/forest_2.jpg)] bg-cover bg-center blur-lg"></div>

      <div className="relative z-10 box_div w-2/3 h-2/3 flex items-center justify-center">
        <div className="div_left flex w-full h-full bg-black">
          <div className="flex flex-col text-white items-center justify-center w-full h-full p-8">
            <div className="div_form w-2/4 flex flex-col">
              <h2 className={`${styles.signupTitle} text-2xl p-4`}>Signup</h2>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <div className={styles.input_field}>
                  <Label htmlFor="email">Email :</Label>
                  <Input type="email" id="email" {...register("email")} />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                {/* Username */}
                <div className={styles.input_field}>
                  <Label htmlFor="username">Username :</Label>
                  <Input type="text" id="username" {...register("username")} />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                </div>

                {/* Password */}
                <div className={styles.input_field}>
                  <Label htmlFor="password">Password :</Label>
                  <Input type="password" id="password" {...register("password")} />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className={styles.input_field}>
                  <Label htmlFor="confirm_password">Confirm Password :</Label>
                  <Input type="password" id="confirm_password" {...register("confirm_password")} />
                  {errors.confirm_password && (
                    <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
                  )}
                </div>

                <Button type="submit">Register</Button>
              </form>

              <h6 className={styles.i_havea_account}>
                <a className="text-blue-300" href="/routes/login">
                  Already have an account?
                </a>
              </h6>
            </div>
          </div>
        </div>

        <div className="div_right flex w-full h-full">
          <img src="/forest_2.jpg" className="object-cover w-full h-full" alt="forest" />
        </div>
      </div>
    </div>
  )
}

export default Page
