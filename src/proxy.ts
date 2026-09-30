import { NextResponse, type NextRequest } from "next/server";

// Cheap presence check only; the signature is verified server-side in getViewer().
export function proxy(request: NextRequest) {
  if (!request.cookies.has("es_session")) return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
