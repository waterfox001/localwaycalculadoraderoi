import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, createHmac } from "node:crypto";
import { DEFAULT_REPORT_CONFIG, type ReportConfig } from "../data/default-report";

const DATA_FILE = resolve(process.cwd(), "data", "report-config.json");
const ADMIN_USER = process.env.ADMIN_USER || "localway";
const ADMIN_PASS = process.env.ADMIN_PASS || "170630";
const SECRET_KEY = process.env.ADMIN_SECRET || randomBytes(32).toString("hex");

// Set of active valid tokens (in-memory, expires in 24h)
const activeTokens = new Map<string, number>();

function createToken(username: string): string {
  const nonce = randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const signature = createHmac("sha256", SECRET_KEY)
    .update(`${username}:${expiresAt}:${nonce}`)
    .digest("hex");
  const token = `${username}.${expiresAt}.${nonce}.${signature}`;
  activeTokens.set(token, expiresAt);
  return token;
}

export function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [username, expiresAtStr, nonce, signature] = parts;
  if (username !== ADMIN_USER) return false;
  const expiresAt = parseInt(expiresAtStr || "0", 10);
  if (Date.now() > expiresAt) {
    activeTokens.delete(token);
    return false;
  }
  const expectedSig = createHmac("sha256", SECRET_KEY)
    .update(`${username}:${expiresAt}:${nonce}`)
    .digest("hex");
  return signature === expectedSig;
}

export function loadStoredConfig(): ReportConfig {
  try {
    if (existsSync(DATA_FILE)) {
      const content = readFileSync(DATA_FILE, "utf-8").trim();
      if (content && content !== "{}") {
        const parsed = JSON.parse(content) as ReportConfig;
        if (parsed.general && parsed.profile && parsed.financial) {
          return {
            ...DEFAULT_REPORT_CONFIG,
            ...parsed,
            general: { ...DEFAULT_REPORT_CONFIG.general, ...parsed.general },
            profile: { ...DEFAULT_REPORT_CONFIG.profile, ...parsed.profile },
            financial: { ...DEFAULT_REPORT_CONFIG.financial, ...parsed.financial },
            history: {
              implementations:
                parsed.history?.implementations ?? DEFAULT_REPORT_CONFIG.history.implementations,
              recurrences: parsed.history?.recurrences ?? DEFAULT_REPORT_CONFIG.history.recurrences,
            },
            diagnostics: {
              ...DEFAULT_REPORT_CONFIG.diagnostics,
              ...parsed.diagnostics,
            },
            explanations: {
              ...DEFAULT_REPORT_CONFIG.explanations,
              ...(parsed.explanations ?? {}),
            },
            charts: parsed.charts ?? DEFAULT_REPORT_CONFIG.charts,
          };
        }
      }
    }
  } catch (err) {
    console.warn("[api-handler] Failed to read report-config.json, using defaults:", err);
  }
  return DEFAULT_REPORT_CONFIG;
}

export function saveStoredConfig(config: ReportConfig): boolean {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[api-handler] Failed to write report-config.json:", err);
    return false;
  }
}

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const corsHeaders = {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 1. POST /api/auth/login
  if (pathname === "/api/auth/login" && request.method === "POST") {
    try {
      const body = (await request.json()) as { username?: string; password?: string };
      const { username, password } = body;

      if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = createToken(username);
        return new Response(
          JSON.stringify({
            success: true,
            token,
            user: { username: ADMIN_USER, name: "Administrador Localway" },
          }),
          { status: 200, headers: corsHeaders },
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "Credenciais inválidas. Verifique o usuário e a senha.",
        }),
        { status: 401, headers: corsHeaders },
      );
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Requisição inválida." }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  // 2. GET or POST /api/auth/verify
  if (pathname === "/api/auth/verify") {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const isValid = verifyToken(token);
    return new Response(JSON.stringify({ valid: isValid }), {
      status: isValid ? 200 : 401,
      headers: corsHeaders,
    });
  }

  // 3. GET /api/report-data
  if (pathname === "/api/report-data" && request.method === "GET") {
    const config = loadStoredConfig();
    return new Response(JSON.stringify({ success: true, data: config }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // 4. POST /api/report-data (Protected)
  if (pathname === "/api/report-data" && request.method === "POST") {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!verifyToken(token)) {
      return new Response(
        JSON.stringify({ success: false, error: "Acesso não autorizado. Faça login novamente." }),
        { status: 401, headers: corsHeaders },
      );
    }

    try {
      const body = (await request.json()) as { data?: ReportConfig };
      if (!body.data) {
        return new Response(JSON.stringify({ success: false, error: "Dados inválidos." }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const saved = saveStoredConfig(body.data);
      if (saved) {
        return new Response(JSON.stringify({ success: true, data: body.data }), {
          status: 200,
          headers: corsHeaders,
        });
      } else {
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao gravar dados no servidor." }),
          { status: 500, headers: corsHeaders },
        );
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: "Erro ao processar dados." }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  // 5. POST /api/report-data/reset (Protected)
  if (pathname === "/api/report-data/reset" && request.method === "POST") {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!verifyToken(token)) {
      return new Response(JSON.stringify({ success: false, error: "Acesso não autorizado." }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    saveStoredConfig(DEFAULT_REPORT_CONFIG);
    return new Response(JSON.stringify({ success: true, data: DEFAULT_REPORT_CONFIG }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ error: "Endpoint não encontrado." }), {
    status: 404,
    headers: corsHeaders,
  });
}
