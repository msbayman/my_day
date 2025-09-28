"use client"
import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
const settings = () => {
  return (
    <div className='flex flex-col w-full items-center justify-center  h-full p-8 gap-4'>
      <h1 className='text-4xl font-bold'>Settings</h1>
      <h1>ayman@test.com</h1>
      <br />
      <br />
      <form className="flex flex-col gap-4 " >
        <Label htmlFor="Username">Username</Label>
        <Input type="text" id="Username" placeholder='Enter your name' />
        <Label htmlFor="Newpassword">New Password</Label>
        <Input type="password" id="Newpassword" placeholder='Enter your New password' />
        <div className="2fa flex gap-3">

          <Label  htmlFor="2Fa">2FA</Label>
          <Checkbox />
        </div>
        <Label htmlFor="Currentpassword">Current Password</Label>
        <Input type="password" id="Currentpassword" placeholder='Enter your Current password' />
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}


export default settings