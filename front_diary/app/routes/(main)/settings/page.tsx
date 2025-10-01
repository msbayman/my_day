"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { updateSettings } from "@/app/actions/settings"

const settingsSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional()
    .or(z.literal("")),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  twoFA: z.boolean().optional(),
  currentPassword: z.string().min(8, "Current password must be at least 8 characters")
})

type SettingsFormData = z.infer<typeof settingsSchema>

const Settings = () => {
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      twoFA: false, 
    }
  })


  const twoFAValue = watch("twoFA")

  const onSubmit = async (data: SettingsFormData) => {
    setPending(true)
    const res = await updateSettings(data)
    if (res.success) {
      alert("Settings updated successfully")
    } else {
      console.error(res.error)
      alert("Error updating settings: " + (res.error.error || res.error))
    }
    setPending(false)
  }

  return (
    <div className="flex flex-col w-full items-center justify-center h-full p-8 gap-4">
      <h1 className="text-4xl font-bold">Settings</h1>

      <form className="flex flex-col gap-4 w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        {/* <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div> */}

        {/* Username */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            placeholder="Enter your username"
            {...register("username")}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New Password (optional)</Label>
          <Input
            type="password"
            id="newPassword"
            placeholder="Enter your new password"
            {...register("newPassword")}
          />
          {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="twoFA"
            checked={twoFAValue}
            onCheckedChange={(checked) => {
              setValue("twoFA", checked === true)
            }}
          />
          <Label htmlFor="twoFA" className="cursor-pointer">Enable Two-Factor Authentication</Label>
        </div>

        <div className="flex flex-col gap-2">
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
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}

export default Settings