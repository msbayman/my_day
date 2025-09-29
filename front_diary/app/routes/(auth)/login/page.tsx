"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import styles from "../../../styles/pages/login.module.css"
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginUser, LoginFormData } from '@/app/actions/login'
import { redirect } from 'next/navigation'

// ✅ client-side zod schema for RHF
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const Page = () => {
  const [err, setErr] = useState("")
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setPending(true)
    setErr("")

    const res = await loginUser(data) // ✅ calls server function

    if (res.success) {
      redirect('dashboard') // or wherever you want to redirect after login
    } else {
      setErr(res.error?.message || "Login failed")
    }
    setPending(false)
  }

  return (
    <div className='relative flex flex-col items-center justify-center h-screen w-full'>
      {/* Blurred Background Image */}
      <div className='absolute inset-0 bg-[url(/forest_2.jpg)] bg-cover bg-center blur-lg'></div>

      {/* Content */}
      <div className="relative z-10 box_div w-2/3 h-2/3 flex items-center justify-center">
        <div className="div_left flex w-full h-full bg-black">
          <div className="flex flex-col text-white items-center justify-center w-full h-full p-8">
            <div className="div_form flex flex-col p-3 w-2/4">
              <h2 className={`${styles.loginTitle} text-2xl p-4`}>Login</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className={`email ${styles.input_field}`}>
                  <Label htmlFor="email">Email :</Label>
                  <Input
                    type="email"
                    id="email"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className={`password ${styles.input_field}`}>
                  <Label htmlFor="password">Password :</Label>
                  <Input
                    type="password"
                    id="password"
                    {...register("password")}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                <Button type="submit" disabled={pending}>
                  {pending ? "Logging in..." : "Login"}
                </Button>
              </form>

              {err && (
                <p className="text-red-500 text-sm mt-4">{err}</p>
              )}

              <h6 className={`${styles.input_field} mt-4`}>
                <a href="/routes/register" className="text-blue-300 hover:underline">Don't have an account?</a>
              </h6>

              <h6 className={`${styles.forget_password} mt-2`}>
                <a href="/forgot-password" className="text-blue-300 hover:underline">Forgot password?</a>
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