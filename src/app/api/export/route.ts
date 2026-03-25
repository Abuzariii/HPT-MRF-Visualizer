// src/app/api/export/route.ts
import { queryDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const settingFilter = searchParams.get("setting") || "all";
  const payerFilter = searchParams.get("payer") || "all";

  try {
    const safeQ = q.replace(/'/g, "''");
    const safeSetting = settingFilter.replace(/'/g, "''");
    const safePayer = payerFilter.replace(/'/g, "''");

    let query = `
      SELECT 
        enriched_hospital_name as hospital_name,
        enriched_hospital_city as hospital_city,
        enriched_hospital_state as hospital_state,
        description, 
        CONCAT_WS(', ', NULLIF(cpt, ''), NULLIF(hcpcs, ''), NULLIF(ms_drg, '')) as code,
        setting, 
        billing_class,
        payer_name,
        plan_name,
        payer_group,
        payer_type,
        gross_charge,
        discounted_cash,
        minimum,
        maximum,
        standard_charge_dollar,
        estimated_amount,
        COALESCE(standard_charge_dollar, estimated_amount) as negotiated_rate,
        methodology
      FROM hospital_charges
      WHERE 1=1
    `;

    if (safeQ)
      query += ` AND (description ILIKE '%${safeQ}%' OR enriched_hospital_name ILIKE '%${safeQ}%' OR cpt ILIKE '%${safeQ}%')`;
    if (safeSetting !== "all") query += ` AND setting ILIKE '${safeSetting}'`;
    if (safePayer !== "all") query += ` AND payer_type ILIKE '${safePayer}'`;

    query += ` ORDER BY COALESCE(standard_charge_dollar, estimated_amount) ASC NULLS LAST LIMIT 5000`;

    const data = await queryDb(query);

    if (data.length === 0)
      return new Response("No data found", { status: 404 });

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((val) => {
            const str = String(val !== null ? val : "");
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    return new Response(`${headers}\n${rows}`, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="hpti_export_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
