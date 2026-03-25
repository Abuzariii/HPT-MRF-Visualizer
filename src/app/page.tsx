import { queryDb } from "@/lib/db";
import KpiCards from "@/components/KpiCards";
import ProcedureChart from "@/components/ProcedureChart";
import PriceComparisonTable from "@/components/PriceComparisonTable";
import { SummaryStats, TopProcedure, SettingStat } from "@/types";

export const dynamic = "force-dynamic";

export default async function TransparencyPlatform() {
  let stats: SummaryStats = {
    total_charges: 0,
    distinct_hospitals: 0,
    avg_gross: 0,
  };
  let topProcedures: TopProcedure[] = [];
  let settingsStats: SettingStat[] = [];

  try {
    const summaryData = await queryDb(`
      SELECT 
        COUNT(*) as total_charges,
        COUNT(DISTINCT hospital_id) as distinct_hospitals,
        AVG(gross_charge) as avg_gross
      FROM hospital_charges WHERE gross_charge IS NOT NULL
    `);

    stats = {
      total_charges: Number(summaryData[0].total_charges),
      distinct_hospitals: Number(summaryData[0].distinct_hospitals),
      avg_gross: Number(summaryData[0].avg_gross),
    };

    const settingsRaw = await queryDb(`
      SELECT LOWER(setting) as setting, CAST(COUNT(*) AS INTEGER) as count, AVG(gross_charge) as avg_charge
      FROM hospital_charges WHERE setting IS NOT NULL AND gross_charge IS NOT NULL
      GROUP BY LOWER(setting) ORDER BY count DESC LIMIT 2
    `);

    settingsStats = settingsRaw.map((r) => ({
      setting: String(r.setting),
      count: Number(r.count),
      avg_charge: Number(r.avg_charge),
    }));

    topProcedures = await queryDb(`
      SELECT description, AVG(gross_charge) as avg_charge, CAST(COUNT(*) AS INTEGER) as frequency
      FROM hospital_charges WHERE description IS NOT NULL AND gross_charge IS NOT NULL
      GROUP BY description HAVING COUNT(*) > 100 ORDER BY avg_charge DESC LIMIT 10
    `);
  } catch (error) {
    console.error("Database initialization failed", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <main className="max-w-400 mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Healthcare Price Transparency
          </h1>
          <p className="text-slate-500 mt-1">
            Empowering patients to compare negotiated rates and cash prices
            across facilities.
          </p>
        </div>

        <KpiCards stats={stats} settingsStats={settingsStats} />

        {/* Layout Change: Chart top row, Table bottom row for maximum readability */}
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full h-100">
            <ProcedureChart data={topProcedures} />
          </div>
          <div className="w-full min-h-150">
            <PriceComparisonTable />
          </div>
        </div>
      </main>
    </div>
  );
}
