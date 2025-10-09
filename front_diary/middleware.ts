import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
   const pathname = request.nextUrl.pathname

   // Skip static / API / next internals
   if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico'
   ) {
      return NextResponse.next()
   }

   const accessToken = request.cookies.get('access_token')?.value
   const refreshToken = request.cookies.get('refresh_token')?.value
   const isPublicPath = ['/routes/login', '/routes/register', '/'].includes(pathname)

   // 1️⃣ User not logged in and accessing private route
   if (!isPublicPath && !accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/routes/login', request.url))
   }

   // 2️⃣ User logged in and accessing public page — redirect to dashboard
   if (isPublicPath && accessToken && pathname !== '/') {
      return NextResponse.redirect(new URL('/routes/dashboard', request.url))
   }

   // 3️⃣ Verify access token (and refresh if expired)
   if (!isPublicPath && accessToken) {
      try {
         const verify = await fetch('http://localhost:8000/api/user_authentication/verify_token/', {
            headers: { Authorization: `Bearer ${accessToken}` },
         })

         if (!verify.ok) throw new Error('Access token invalid')
      } catch (error) {
         // Attempt to refresh access token
         if (refreshToken) {
            try {
               const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refresh: refreshToken }),
               })

               if (refreshResponse.ok) {
                  const data = await refreshResponse.json()
                  const newAccessToken = data.access

                  // Rebuild response with updated cookie
                  const response = NextResponse.next()
                  response.cookies.set('access_token', newAccessToken, {
                     httpOnly: true,
                     secure: process.env.NODE_ENV === 'production',
                     sameSite: 'strict',
                     path: '/',
                  })
                  return response
               } else {
                  // Refresh failed → clear cookies & redirect
                  const response = NextResponse.redirect(new URL('/routes/login', request.url))
                  response.cookies.delete('access_token')
                  response.cookies.delete('refresh_token')
                  return response
               }
            } catch {
               const response = NextResponse.redirect(new URL('/routes/login', request.url))
               response.cookies.delete('access_token')
               response.cookies.delete('refresh_token')
               return response
            }
         } else {
            // No refresh token
            const response = NextResponse.redirect(new URL('/routes/login', request.url))
            response.cookies.delete('access_token')
            response.cookies.delete('refresh_token')
            return response
         }
      }
   }

   return NextResponse.next()
}

export const config = {
   matcher: ['/:path*'],
}
