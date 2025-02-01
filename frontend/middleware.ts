import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define a type for session metadata with an optional 'role' property
type SessionClaims = {
  metadata?: {
    role?: string;
  };
};

// Create route matchers for admin and public routes
const isAdminRoute = createRouteMatcher(['/dashboard-admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/', // Home page
  '/sign-in(.*)', // Sign-in page and subroutes
  '/sign-up(.*)', // Sign-up page and subroutes
]);

export default clerkMiddleware(async (auth, req) => {
  // Get the session and claims
  const { sessionClaims, userId } = await auth();
  const claims = sessionClaims as SessionClaims;

  // Log user ID and claims for debugging
  console.log('User  ID:', userId);
  console.log('Claims:', claims);

  // Check if the request is to a public route
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If no user is authenticated, protect non-public routes
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Check if the request is to an admin route
  if (isAdminRoute(req)) {
    // If not an admin, redirect to the dashboard
    if (claims?.metadata?.role !== 'admin') {
      console.log('Redirecting non-admin user to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // If user is an admin but not on an admin route, redirect to the admin dashboard
  if (claims?.metadata?.role === 'admin' && !isAdminRoute(req)) {
    console.log('Admin user redirected to admin dashboard');
    return NextResponse.redirect(new URL('/dashboard-admin', req.url));
  }

  // For authenticated non-admin users on non-public routes
  if (claims?.metadata?.role !== 'admin') {
    // Ensure they're on an appropriate route
    if (req.nextUrl.pathname.startsWith('/dashboard-admin')) {
      console.log('Non-admin user redirected from admin route to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Allow the request to continue if none of the above conditions matched
  return NextResponse.next();
});

// Configuration for the middleware matcher
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};