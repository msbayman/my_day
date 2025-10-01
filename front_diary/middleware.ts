// middleware.ts (Recommended)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
   const pathname = request.nextUrl.pathname
   if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.') || 
      pathname === '/favicon.ico'
   ) {
      return NextResponse.next()
   }

   const accessToken = request.cookies.get('access_token')?.value
   const isPublicPath = ['/routes/login', '/routes/register', '/'].includes(pathname)

   if (!isPublicPath && !accessToken) {
      return NextResponse.redirect(new URL('/routes/login', request.url))
   }

   if (isPublicPath && accessToken && pathname !== '/') {
      return NextResponse.redirect(new URL('/routes/dashboard', request.url))
   }

   if (!isPublicPath && accessToken) {
      try {
         const response = await fetch('http://localhost:8000/api/user_authentication/verify_token/', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
         })
         if (!response.ok) throw new Error('Invalid token')
      } catch (error) {
         const response = NextResponse.redirect(new URL('/routes/login', request.url))
         response.cookies.delete('access_token')
         response.cookies.delete('refresh_token')
         return response
      }
   }

   return NextResponse.next()
}
export const config = {
   matcher: ['/:path*']
}