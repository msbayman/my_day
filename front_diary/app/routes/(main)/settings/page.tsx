"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { email, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"


const settingsSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  twoFA: z.boolean().optional(),
  currentPassword: z.string().min(6, "Current password is required"),
})


type SettingsFormData = z.infer<typeof settingsSchema>

const Settings = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  const onSubmit = (data: SettingsFormData) => {
    console.log("Form submitted:", data)
  }

  return (
    <div className="flex flex-col w-full items-center justify-center h-full p-8 gap-4">
      <h1 className="text-4xl font-bold">Settings</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor="email">Email</Label>  
        <Input type="email" id="email" placeholder="Enter your email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        <Label htmlFor="username">Username</Label>
        <Input type="text" id="username" placeholder="Enter your name" {...register("username")} />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        <Label htmlFor="newPassword">New Password</Label>
        <Input
          type="password"
          id="newPassword"
          placeholder="Enter your new password"
          {...register("newPassword")}
        />
        {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}


        <div className="2fa flex gap-3 items-center">
          <Label htmlFor="twoFA">2FA</Label>
          <Checkbox id="twoFA" {...register("twoFA")} />
        </div>

 
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          type="password"
          id="currentPassword"
          placeholder="Enter your current password"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>
        )}

        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}

export default Settings
