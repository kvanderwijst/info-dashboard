import { createClient } from "@supabase/supabase-js";
import { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchHomewizardValue } from "../../lib/fetch_homewizard.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Fetch HomeWizard data
    const offset_days = 1; // Yesterday
    const gas_value = await fetchHomewizardValue(offset_days);

    const day_str = getDateString(offset_days);

    // 2. Insert into Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const { error } = await supabase.from("gas_usage_daily").upsert(
      {
        day: day_str,
        value: gas_value,
      },
      {
        onConflict: "day",
      },
    );

    if (error) throw Error(error.message);

    return res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unknown error" });
  }
}

function getDateString(offset_days: number = 0): string {
  const now = new Date();
  now.setDate(now.getDate() - offset_days);
  return now.toISOString().slice(0, 10);
}
