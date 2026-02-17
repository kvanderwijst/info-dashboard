import type { VercelRequest, VercelResponse } from "@vercel/node";

const LATITUDE = "52.0512";
const LONGITUDE = "6.103";
const VAR = "temperature_2m_mean";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // const path = req.url!.replace(/^\/api\/openmeteo/, "");
  const { past_days, forecast_days } = req.query;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=${VAR}&timezone=Europe%2FBerlin&past_days=${past_days}&forecast_days=${forecast_days}`;

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
