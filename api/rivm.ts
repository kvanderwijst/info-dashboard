import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch("https://www.rivm.nl/downloadcsv/962321");

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch RIVM data" });
    }

    const csv = await response.text();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Cache-Control", "s-maxage=3600"); // cache 1 hour on Vercel
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
