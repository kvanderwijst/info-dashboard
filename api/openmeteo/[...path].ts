import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url!.replace(/^\/api\/openmeteo/, "");

  const url = "https://api.open-meteo.com/v1" + path;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000); // 5s

  try {
    const r = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    res.status(r.status).send(await r.text());
  } catch (err: any) {
    if (err.name === "AbortError") {
      res.status(504).json({ error: "Upstream API timeout" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    clearTimeout(timeout);
  }
}
