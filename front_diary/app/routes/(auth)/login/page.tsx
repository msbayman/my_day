import React, { use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import styles from "../../../styles/pages/login.module.css"
import { useForm } from 'react-hook-form'
const page = () => {
  return  (

    <div className='relative flex flex-col items-center justify-center h-screen w-full'>
      {/* Blurred Background Image */}
      <div className='absolute inset-0 bg-[url(/forest_2.jpg)] bg-cover bg-center blur-lg'></div>

      {/* Content */}
      <div className="relative z-10 box_div w-2/3 h-2/3 flex items-center justify-center">
        <div className="div_left flex w-full h-full bg-black">
          <div className="flex flex-col text-white items-center justify-center w-full h-full p-8">
            <div className="div_form flex flex-col p-3   ">
              <h2 className={`${styles.loginTitle} text-2xl p-4`}>Login</h2>
              <form className=" flex flex-col  ">
                <div className={`email ${styles.input_field}`}>

                  <Label htmlFor="email">Email :</Label>
                  <Input type="email" id="email" />
                </div>

                <div className={`password ${styles.input_field}`}>

                  <Label htmlFor="password">Password :</Label>
                  <Input type="password" id="password" />

                </div>

                <h6 className={`${styles.input_field}`}>
                  <a href="/routes/register" className="text-blue-300 hover:underline">Don't have an account?</a>
                </h6>
                <Button type="submit">Login</Button>
              </form>
              <h6 className={`${styles.forget_password}`}>
                <a href="/routes/register" >forget password?</a>
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

export default page
