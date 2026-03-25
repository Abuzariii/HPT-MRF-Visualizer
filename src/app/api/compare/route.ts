// src/app/api/compare/route.ts
import { NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const settingFilter = searchParams.get("setting") || "all";
  const payerFilter = searchParams.get("payer") || "all";

  const limit = 15;
  const offset = (page - 1) * limit;

  try {
    const safeQ = q.replace(/'/g, "''");
    const safeSetting = settingFilter.replace(/'/g, "''");
    const safePayer = payerFilter.replace(/'/g, "''");

    let query = `
      SELECT 
        enriched_hospital_name as hospital_name,
        description, 
        CONCAT_WS(', ', NULLIF(cpt, ''), NULLIF(hcpcs, ''), NULLIF(ms_drg, '')) as code,
        payer_name,
        plan_name,
        payer_group,
        payer_type,
        setting, 
        discounted_cash,
        COALESCE(standard_charge_dollar, estimated_amount) as negotiated_rate,
        methodology
      FROM hospital_charges
      WHERE 1=1
    `;

    // 1. Text Search
    if (safeQ) {
      query += ` AND (description ILIKE '%${safeQ}%' OR enriched_hospital_name ILIKE '%${safeQ}%' OR cpt ILIKE '%${safeQ}%')`;
    }

    // 2. Dropdown Filters
    if (safeSetting !== "all") {
      query += ` AND setting ILIKE '${safeSetting}'`;
    }
    if (safePayer !== "all") {
      query += ` AND payer_type ILIKE '${safePayer}'`;
    }

    query += ` ORDER BY COALESCE(standard_charge_dollar, estimated_amount) ASC NULLS LAST LIMIT ${limit} OFFSET ${offset}`;

    const results = await queryDb(query);
    return NextResponse.json({ data: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
