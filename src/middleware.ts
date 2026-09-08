import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname === "/";

  if (isAuthPage) {
    if (isAuth) {
      if (!token.role) {
        // Zepsuty stary token z poprzednich sesji deweloperskich
        return NextResponse.next(); // Pozwoli im wejść na główną i zalogować się ponownie
      }
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (token.role === "TEACHER") {
        return NextResponse.redirect(new URL("/teacher", req.url));
      } else {
        return NextResponse.redirect(new URL("/client", req.url));
      }
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Role based access control
  const path = req.nextUrl.pathname;
  
  if (path.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  if (path.startsWith("/teacher") && token.role !== "TEACHER" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (path.startsWith("/client") && token.role !== "STUDENT" && token.role !== "PARENT" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/teacher/:path*", "/client/:path*"],
};
