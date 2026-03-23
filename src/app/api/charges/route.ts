// src/app/api/charges/route.ts
import { NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 15; // Rows per page
  const offset = (page - 1) * limit;

  try {
    // Sanitize the search query to prevent basic SQL injection issues in our string building
    const safeQ = q.replace(/'/g, "''");

    let query = `
      SELECT 
        description, 
        gross_charge, 
        setting, 
        enriched_hospital_name,
        enriched_hospital_state
      FROM hospital_charges
    `;

    // If there is a search term, do a wildcard search across description and hospital name
    if (safeQ) {
      query += ` WHERE description ILIKE '%${safeQ}%' OR enriched_hospital_name ILIKE '%${safeQ}%'`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const results = await queryDb(query);

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
