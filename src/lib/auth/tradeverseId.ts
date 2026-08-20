import { importSPKI, jwtVerify } from "jose";

// Verifies Tradeverse ID access tokens (RS256). Uses `jose`, not `jsonwebtoken`,
// specifically because this runs inside Next.js middleware (Edge runtime) as well
// as regular server components/route handlers — jose works in both; jsonwebtoken
// only works in Node.
//
// REQUIRED: JWT_PUBLIC_KEY and TRADEVERSE_ID_HOSTNAME must match W1's values
// byte-for-byte for this environment (see W1's Phase 2/5 notes). This app never
// hosts Tradeverse ID's routes, so it has no reason to set TRADEVERSE_ID_HOSTNAME
// for routing — only for this issuer check.
export interface TradeverseIdSessionUser {
  id: string;
  email: string;
  role: string;
}

const ISSUER = process.env.TRADEVERSE_ID_HOSTNAME || "https://auth.tradeversejournal.com";

function loadPublicKeyPem(): string {
  const raw = process.env.JWT_PUBLIC_KEY;
  if (!raw) throw new Error("JWT_PUBLIC_KEY is not set");
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

let cachedKey: ReturnType<typeof importSPKI> | null = null;
function getPublicKey() {
  if (!cachedKey) {
    cachedKey = importSPKI(loadPublicKeyPem(), "RS256");
  }
  return cachedKey;
}

export async function verifyTradeverseIdAccessToken(
  token: string,
): Promise<TradeverseIdSessionUser | null> {
  try {
    const key = await getPublicKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["RS256"],
      issuer: ISSUER,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      role: typeof payload.role === "string" ? payload.role : "user",
    };
  } catch {
    return null;
  }
}
