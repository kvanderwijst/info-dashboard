import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url!.replace(/^\/api\/anwb/, "");

  const url = "https://api.anwb.nl/energy/energy-services/v2/tarieven" + path;

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
