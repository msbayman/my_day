import React, { use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import styles from "./styles/pages/register.module.css"
import styles from "../../styles/pages/register.module.css"
// import { Label } from "@/components/ui/Label"
import { useForm } from 'react-hook-form'


const page = () => {
  return (

    <div className='relative flex flex-col items-center justify-center h-screen w-full'>
      {/* Blurred Background Image */}
      <div className='absolute inset-0 bg-[url(/forest_2.jpg)] bg-cover bg-center blur-lg'></div>

      {/* Content */}
      <div className="relative z-10 box_div w-2/3 h-2/3 flex items-center justify-center">
        <div className="div_left flex w-full h-full bg-black">
          <div className="flex flex-col text-white items-center justify-center w-full h-full p-8">
            <div className="div_form flex flex-col p-3   ">
              <h2 className={`${styles.signupTitle} text-2xl p-4`}>Signup</h2>
              <form className=" flex flex-col  ">
                <div className={`email ${styles.input_field}`}>

                  <Label htmlFor="email">Email :</Label>
                  <Input type="email" id="email" />
                </div>
                <div className={`username ${styles.input_field}`}>

                  <Label htmlFor="username">Username :</Label>
                  <Input type="text" id="username" />
                </div>
                <div className={`password ${styles.input_field}`}>

                  <Label  htmlFor="password">Password :</Label>
                  <Input type="password" id="password" />

                </div>
                <div className={`confirm_password ${styles.input_field}`}>
                  <Label htmlFor="confirm_password">Confirm Password :</Label>

                  <Input type="password" id="confirm_password" />
                </div>
                <Button type="submit">Register</Button>
              </form>
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