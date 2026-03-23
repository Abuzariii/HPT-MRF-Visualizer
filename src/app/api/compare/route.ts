import { NextResponse } from "next/server";
import { dbAll } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const safeQ = q.replace(/'/g, "''");

    // Select the key columns for a patient to compare prices
    let query = `
      SELECT 
        description, 
        gross_charge,
        discounted_cash,
        minimum,
        maximum,
        setting, 
        enriched_hospital_name as hospital_name,
        enriched_hospital_city as hospital_city,
        enriched_hospital_state as hospital_state
      FROM hospital_charges
    `;

    if (safeQ) {
      // Prioritize searching by procedure description, but fallback to hospital
      query += ` WHERE description ILIKE '%${safeQ}%' OR enriched_hospital_name ILIKE '%${safeQ}%'`;
    }

    // Order by gross charge ascending so the patient sees the cheapest options first
    query += ` ORDER BY gross_charge ASC NULLS LAST LIMIT ${limit} OFFSET ${offset}`;

    const results = await dbAll(query);
    return NextResponse.json({ data: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
