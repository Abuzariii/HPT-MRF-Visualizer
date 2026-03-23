"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TopProcedure } from "@/types";

export default function ProcedureChart({ data }: { data: TopProcedure[] }) {
  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader>
        <CardTitle>Costliest Procedures</CardTitle>
        <CardDescription>Top 10 highest average gross charges</CardDescription>
      </CardHeader>
      {/* FIX: Separated min-h-[400px] and relative */}
      <CardContent className="flex-1 min-h-100 relative p-4 pl-0">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                fontSize={12}
                stroke="#94a3b8"
              />
              <YAxis
                dataKey="description"
                type="category"
                width={180}
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="avg_charge" fill="#0f172a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
