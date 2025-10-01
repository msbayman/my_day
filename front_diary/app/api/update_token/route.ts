import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
   const { token } = await request.json()

   const cookieStore = await cookies()
   cookieStore.set('access_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 
   })

   return NextResponse.json({ success: true })
}