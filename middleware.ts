import { NextRequest,NextResponse } from "next/server";

const protectedRoutes = ["/feed","/me","/create"];
const authRoutes = ["/login","/register"];

export function middleware(request:NextRequest){
    const {pathname} = request.nextUrl;
  const accessToken = request.cookies.get("sb-access-token")?.value;

    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    )

    const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if(isProtectedRoute && !accessToken){
    return NextResponse.redirect(new URL("/login",request.url));
  }

  if(isAuthRoute && accessToken){
    return NextResponse.redirect(new URL("/feed",request.url));
  }

  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed/:path*", "/me/:path*", "/create/:path*", "/login/:path*", "/register/:path*"],
};