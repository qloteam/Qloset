import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import jwkToPem from "jwk-to-pem";
import jwt from "jsonwebtoken";
// import fetch from "node-fetch"; // Node < 18 only

let jwksCache: any = null;
async function getJwks() {
  if (!jwksCache) {
    const url = `${process.env.SUPABASE_URL}/auth/v1/keys`;
    const res = await fetch(url as string);
    jwksCache = await res.json();
  }
  return jwksCache;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth: string = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) throw new UnauthorizedException("Missing token");

    const jwks = await getJwks();
    const header = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
    const key = jwks.keys.find((k: any) => k.kid === header.kid);
    if (!key) throw new UnauthorizedException("Invalid token (kid)");

    const pem = jwkToPem(key);
    const payload = jwt.verify(token, pem, { algorithms: ["RS256"] });
    req.user = payload; // user id in req.user.sub
    return true;
  }
}
