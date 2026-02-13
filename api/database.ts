import { createClient } from "@supabase/supabase-js";
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { type, start_date, end_date } = req.query;

    // Check if type is either "gas_usage" or "daily_temperature"
    if (type !== "gas_usage_daily" && type !== "temperature_daily") {
      return res.status(400).json({ error: "Invalid type parameter" });
    }

    // Set up connection to database
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );

    // Get data from the database
    const { data, error } = await supabase
      .from(type as string)
      .select("*")
      .gte("day", String(start_date))
      .lte("day", String(end_date));

    if (error) throw Error(error.message);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unknown error" });
  }
}
