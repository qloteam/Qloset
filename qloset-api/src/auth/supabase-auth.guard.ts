import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import jwkToPem from "jwk-to-pem";
import jwt from "jsonwebtoken";

let jwksCache: any = null;

// ✅ Fetch Supabase JWKS securely using anon key
async function getJwks() {
  try {
    if (!jwksCache) {
      const base = process.env.SUPABASE_URL;
      const anonKey = process.env.SUPABASE_ANON_KEY;

      const urls = [
        `${base}/auth/v1/keys`,
        `${base}/auth/v1/.well-known/jwks.json`,
      ];

      let res: Response | null = null;
      for (const url of urls) {
        res = await fetch(url, {
          headers: { apikey: anonKey || "" }, // ✅ include anon key
        });
        if (res.ok) {
          console.log("✅ Loaded JWKs from:", url);
          break;
        } else {
          console.warn(`❌ ${url} → ${res.status} ${res.statusText}`);
        }
      }

      if (!res || !res.ok) throw new Error("No valid JWKS endpoint found");
      jwksCache = await res.json();
    }

    if (!jwksCache || !Array.isArray(jwksCache.keys)) {
      throw new Error("Invalid JWKS structure");
    }
    return jwksCache;
  } catch (err) {
    console.error("❌ Failed to load JWKs:", err);
    throw new UnauthorizedException("Failed to verify Supabase token");
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const authHeader: string = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid Authorization header");
    }

    const token = authHeader.slice(7);

    try {
      const jwks = await getJwks();
      if (!jwks?.keys?.length) {
        throw new UnauthorizedException("No keys found in Supabase JWKS");
      }

      const header = JSON.parse(
        Buffer.from(token.split(".")[0], "base64").toString()
      );

      const key = jwks.keys.find((k: any) => k.kid === header.kid);
      if (!key) {
        console.error("❌ No matching key ID found in JWKS for kid:", header.kid);
        throw new UnauthorizedException("Invalid token (unknown kid)");
      }

      const pem = jwkToPem(key);
      let payload: any;

try {
  // 🔒 Try RS256 first (used by old Supabase projects)
  payload = jwt.verify(token, pem, { algorithms: ["RS256"] });
} catch (e) {
  // 🧩 Fallback to HS256 if project uses shared secret
  try {
    payload = jwt.verify(token, process.env.SUPABASE_ANON_KEY as string, {
      algorithms: ["HS256"],
    });
    console.log("✅ Verified Supabase token using HS256 shared secret");
  } catch (err) {
    console.error("❌ Token verification failed for both RS256 and HS256");
    throw new UnauthorizedException("Invalid or expired token");
  }
}


      // Attach user data for downstream controllers
      req.user = payload;
      return true;
    } catch (err: any) {
      console.error("Auth verification failed:", err.message || err);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
