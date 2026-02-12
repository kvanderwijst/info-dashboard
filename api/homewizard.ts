import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchHomewizardValue } from "../lib/fetch_homewizard.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const value = await fetchHomewizardValue();
    res.status(200).json({ value });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unknown error" });
  }
}
