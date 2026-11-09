import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, setResponseHeaders } from "@tanstack/react-start/server";
import { env } from "node:process";

const SPIKE_COOKIE = "ao_saas_runtime_spike";
const SPIKE_COOKIE_VALUE = "server-cookie-ok";

/**
 * Temporary, non-authentication probe.
 *
 * This function deliberately returns only boolean diagnostics. It never
 * returns the private variable value or treats this cookie as a session.
 */
export const runVercelRuntimeProbe = createServerFn({ method: "POST" }).handler(async () => {
  const cookieBefore = getCookie(SPIKE_COOKIE) ?? null;
  const privateVariableConfigured = Boolean(env["AO_SAAS_SPIKE_SECRET"]);
  const isVercel = env["VERCEL"] === "1";

  setCookie(SPIKE_COOKIE, SPIKE_COOKIE_VALUE, {
    httpOnly: true,
    secure: isVercel || env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  setResponseHeaders(
    new Headers({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    }),
  );

  return {
    probe: "ao-saas-vercel-runtime",
    execution: "server-function",
    provider: isVercel ? "vercel" : "local-or-other",
    nodeRuntime: isVercel ? (env["VERCEL_REGION"] ?? "vercel-region-unavailable") : "not-confirmed",
    cookieReceived: cookieBefore === SPIKE_COOKIE_VALUE,
    cookieWritten: true,
    cookieHttpOnly: true,
    privateVariableConfigured,
    privateVariableValueExposed: false,
  } as const;
});
