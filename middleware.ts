import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define all possible role types
type UserRole = "admin" | "super_admin" | "moderator" | "user" | undefined;

// Define protected routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isModeratorRoute = createRouteMatcher(["/moderator(.*)"]);

// Define routes that need cache control
const noCacheRoutes = ["/api/member-stores", "/api/stores/:path*/info"];
const isNoCacheRoute = createRouteMatcher(noCacheRoutes);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  
  // Create initial response
  let response: NextResponse;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/webhook",
    "/api/stores",
    "/api/invitations/accept",
    "/accept-invitation",
    "/api/check-store-access", // New API route for checking store access
  ];

  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  // If no user is logged in, redirect to sign-in for protected routes
  if (!userId) {
    if (isPublicRoute) {
      response = NextResponse.next();
    } else if (isAdminRoute(req) || isModeratorRoute(req) || isStoreRoute(req.nextUrl.pathname)) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    } else {
      response = NextResponse.next();
    }
  } else {
    // Get user role from metadata with proper type annotation
    const userRole = sessionClaims?.metadata?.role as UserRole;

    // Protect admin routes - only admins and super_admins can access
    if (isAdminRoute(req) && userRole !== "admin" && userRole !== "super_admin") {
      console.log("Unauthorized admin access attempt:", userId, "Role:", userRole);
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }

    // Protect moderator routes - only admins, super_admins and moderators can access
    if (isModeratorRoute(req) && userRole !== "admin" && userRole !== "super_admin" && userRole !== "moderator") {
      console.log("Unauthorized moderator access attempt:", userId, "Role:", userRole);
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }

    // Check store access permissions
    const pathname = req.nextUrl.pathname;

    // Allow users to create a store
    if (pathname === "/") {
      response = NextResponse.next();
    } else {
      // Check if the user is trying to access a specific store
      const storeId = getStoreIdFromPath(pathname);

      // If not a valid UUID format or not a store route, just proceed
      response = NextResponse.next();
    }
  }

  // Apply cache control headers to specific routes
  if (isNoCacheRoute(req)) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
});

// Helper function to check if a path is a store route
function isStoreRoute(pathname: string): boolean {
  const segments = pathname.split("/");
  if (segments.length < 2) return false;

  const potentialStoreId = segments[1];
  return isValidUUID(potentialStoreId);
}

// Helper function to extract store ID from path
function getStoreIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  if (segments.length < 2) return null;

  const potentialStoreId = segments[1];
  return isValidUUID(potentialStoreId) ? potentialStoreId : null;
}

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|_vercel).*)", "/api/(.*)"],
};