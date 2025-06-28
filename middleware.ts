import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import dbConnect from '@/lib/db'
import Session from '@/models/Session'
import User from '@/models/User'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only check session validation on the home route "/"
  if (pathname === '/') {
    try {
      // Get the session token from cookies
      const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                          request.cookies.get('__Secure-next-auth.session-token')?.value
      
      if (sessionToken) {
        // Decode the JWT token to get user info (simplified approach)
        const tokenParts = sessionToken.split('.')
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
            
            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp < currentTime) {
              console.log('Session token expired, clearing cookies')
              
              const response = NextResponse.redirect(new URL('/login', request.url))
              
              // Clear the session cookies
              response.cookies.delete('next-auth.session-token')
              response.cookies.delete('__Secure-next-auth.session-token')
              response.cookies.delete('next-auth.csrf-token')
              response.cookies.delete('__Secure-next-auth.csrf-token')
              response.cookies.delete('next-auth.callback-url')
              response.cookies.delete('__Secure-next-auth.callback-url')
              
              return response
            }
          } catch (error) {
            console.error('Error decoding session token:', error)
            // If token is malformed, clear it
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('next-auth.session-token')
            response.cookies.delete('__Secure-next-auth.session-token')
            return response
          }
        }
      }
    } catch (error) {
      console.error('Error in middleware session validation:', error)
      // If there's any error, continue with the request
    }
  }
  
  // Continue with the request
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
