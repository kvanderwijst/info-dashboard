import type { VercelRequest, VercelResponse } from "@vercel/node";

const NED_URL = "https://api.ned.nl/v1/utilizations";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      type,
      granularity,
      classification,
      activity,
      time_before,
      time_after,
    } = req.query;

    const params = new URLSearchParams({
      point: "0",
      type: String(type),
      granularity: String(granularity),
      granularitytimezone: "1",
      classification: String(classification),
      activity: String(activity),
      "validfrom[strictly_before]": String(time_before),
      "validfrom[after]": String(time_after),
    });

    const response = await fetch(`${NED_URL}?${params.toString()}`, {
      headers: {
        "X-AUTH-TOKEN": process.env.API_NED!,
        accept: "application/ld+json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error in response from NED API",
        status: response.status,
      });
    }

    const json = await response.json();

    // keep exact behavior from Express
    res.status(200).json(json["hydra:member"]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
