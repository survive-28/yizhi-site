// Netlify Edge Function: Server-side Beijing Time (UTC+8) gate for W100 Launch Slides
// Strictly unlocks at 2026-11-24 14:40:00 CST (2026-11-24T06:40:00.000Z)

const UNLOCK_AT_ISO = "2026-11-24T14:40:00+08:00";
const UNLOCK_EPOCH_MS = Date.parse(UNLOCK_AT_ISO); // 1795502400000

const NO_CACHE_HEADERS = {
  "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
  "pragma": "no-cache",
  "x-unlock-at": UNLOCK_AT_ISO,
};

export default async function handler(request, context) {
  const url = new URL(request.url);
  const path = url.pathname;
  const nowMs = Date.now();
  const unlocked = nowMs >= UNLOCK_EPOCH_MS;

  // 1. JSON status interface: GET /api/slides-status
  if (path === "/api/slides-status") {
    const remainingMs = Math.max(0, UNLOCK_EPOCH_MS - nowMs);
    return new Response(
      JSON.stringify({
        unlocked,
        unlockAt: UNLOCK_AT_ISO,
        unlockAtUtc: new Date(UNLOCK_EPOCH_MS).toISOString(),
        serverTimeUtc: new Date(nowMs).toISOString(),
        remainingMs,
        slidesUrl: unlocked ? "/slides/" : null,
        lockedUrl: "/slides-locked.html",
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...NO_CACHE_HEADERS,
        },
      }
    );
  }

  // 2. Hard server-side embargo for /slides and /slides/* prior to 2026-11-24 14:40:00 CST
  if (!unlocked) {
    const isPageRequest =
      path === "/slides" ||
      path === "/slides/" ||
      path === "/slides/index.html" ||
      (request.headers.get("accept") || "").includes("text/html");

    if (isPageRequest) {
      const lockedResp = await context.rewrite("/slides-locked.html");
      const headers = new Headers(lockedResp.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", NO_CACHE_HEADERS["cache-control"]);
      headers.set("pragma", "no-cache");
      headers.set("x-unlock-at", UNLOCK_AT_ISO);
      headers.set("x-slides-locked", "true");
      return new Response(lockedResp.body, {
        status: 403,
        headers,
      });
    }

    // Block direct fetches to /slides/js/*, /slides/css/*, /slides/assets/* before unlock
    return new Response(
      JSON.stringify({
        error: "EMBARGOED",
        message: "YIZHI W100 Launch Slides open on 24 Nov 2026 at 14:40 CST (Beijing Time).",
        unlockAt: UNLOCK_AT_ISO,
        serverTimeUtc: new Date(nowMs).toISOString(),
      }),
      {
        status: 403,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...NO_CACHE_HEADERS,
        },
      }
    );
  }

  // 3. After unlock: redirect bare /slides to /slides/ so relative assets resolve cleanly
  if (path === "/slides") {
    return Response.redirect(new URL("/slides/" + url.search, url), 302);
  }

  const response = await context.next();
  response.headers.set("cache-control", "public, max-age=0, must-revalidate");
  return response;
}
