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

interface DashboardChartsProps {
  data: TopProcedure[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Top 10 Procedures</CardTitle>
        <CardDescription>
          By average gross charge across all hospitals
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-100 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                vertical={true}
                stroke="#e2e8f0"
              />
              <XAxis
                type="number"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                dataKey="description"
                type="category"
                width={250}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                // formatter={(value: number) => [
                //   `$${value.toLocaleString(undefined, {
                //     minimumFractionDigits: 2,
                //     maximumFractionDigits: 2,
                //   })}`,
                //   "Avg Charge",
                // ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
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
