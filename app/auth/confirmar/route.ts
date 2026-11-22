import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Destino dos links de email (confirmação de conta e recuperação de palavra-passe).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const seguinte = searchParams.get("seguinte") ?? "/conta?confirmado=1";
  const destino = seguinte.startsWith("/") ? seguinte : "/conta";

  const supabase = await supabaseServer();
  let erro = true;
  if (code) {
    erro = Boolean((await supabase.auth.exchangeCodeForSession(code)).error);
  } else if (tokenHash && type) {
    erro = Boolean((await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error);
  }
  return NextResponse.redirect(new URL(erro ? "/entrar?erro=link" : destino, origin));
}
