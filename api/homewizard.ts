import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const nowSeconds = Date.now() / 1000;
    const url =
      "https://hwenergy.app/totals" +
      "?home=488575" +
      "&identifier=p1dongle/5c2faf0b7fa8_gas" +
      "&period=1" +
      `&date=${nowSeconds}` +
      "&timeZone=Europe/Amsterdam";
    const upstream = await fetch(url, {
      headers: {
        cookie: process.env.HWENERGY_COOKIES as string,
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream failed" });
    }

    const data = await upstream.json();

    if (!data?.valueDiv) {
      return res.status(401).json({ error: "Session expired" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
}
