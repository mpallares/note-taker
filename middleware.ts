import { auth } from "@/auth"

export default auth((req) => {
  // The routes that require authentication
  if (!req.auth && req.nextUrl.pathname.startsWith("/notes")) {
    const newUrl = new URL("/login", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/notes/:path*"],
}
