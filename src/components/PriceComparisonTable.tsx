// src/components/PriceComparisonTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import { ComparisonRecord } from "@/types";
import { useDebounce } from "@/lib/useDebounce";

export default function PriceComparisonTable() {
  const [data, setData] = useState<ComparisonRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("MRI");
  const [setting, setSetting] = useState("all");
  const [payerType, setPayerType] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const url = `/api/compare?q=${encodeURIComponent(
          debouncedSearch
        )}&setting=${setting}&payer=${payerType}&page=${page}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [debouncedSearch, setting, payerType, page]);

  useEffect(() => setPage(1), [debouncedSearch, setting, payerType]);

  const handleExport = () => {
    const url = `/api/export?q=${encodeURIComponent(
      debouncedSearch
    )}&setting=${setting}&payer=${payerType}`;
    window.open(url, "_blank");
  };

  const formatCurrency = (val: number | null) =>
    val
      ? `$${val.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "--";

  return (
    <Card className="flex flex-col h-full shadow-sm w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Compare Procedure Costs</CardTitle>
            <CardDescription>
              Search and filter standard charges across all facilities.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search descriptions, hospitals, or codes..."
              className="pl-10 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="flex h-10 w-full md:w-48 rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          >
            <option value="all">All Settings</option>
            <option value="inpatient">Inpatient</option>
            <option value="outpatient">Outpatient</option>
          </select>

          <select
            className="flex h-10 w-full md:w-48 rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={payerType}
            onChange={(e) => setPayerType(e.target.value)}
          >
            <option value="all">All Payers</option>
            <option value="commercial">Commercial</option>
            <option value="medicare">Medicare</option>
            <option value="medicaid">Medicaid</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col relative p-0">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        )}

        {/* Expanded min-width to accommodate all 17 columns comfortably */}
        <div className="border-y overflow-x-auto">
          <Table className="min-w-600">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-50">Hospital</TableHead>
                <TableHead className="w-30">Location</TableHead>
                <TableHead className="w-62.5">Description</TableHead>
                <TableHead className="w-25">Code</TableHead>
                <TableHead className="w-25">Setting</TableHead>
                <TableHead className="w-30">Billing Class</TableHead>
                <TableHead className="w-37.5">Payer</TableHead>
                <TableHead className="w-37.5">Plan</TableHead>
                <TableHead className="w-30">Payer Type</TableHead>
                <TableHead className="text-right w-30">Gross Charge</TableHead>
                <TableHead className="text-right w-30">Cash Price</TableHead>
                <TableHead className="text-right w-30">Minimum</TableHead>
                <TableHead className="text-right w-30">Maximum</TableHead>
                <TableHead className="text-right w-30">Standard $</TableHead>
                <TableHead className="text-right w-30">Estimated $</TableHead>
                <TableHead className="text-right w-35 text-emerald-700 font-bold bg-emerald-50/50">
                  Negotiated Rate
                </TableHead>
                <TableHead className="w-50">Methodology</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={17}
                    className="h-32 text-center text-slate-500"
                  >
                    No matching procedures found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-slate-50 text-xs md:text-sm"
                  >
                    <TableCell
                      className="font-medium truncate max-w-50"
                      title={row.hospital_name}
                    >
                      {row.hospital_name || "--"}
                    </TableCell>
                    <TableCell
                      className="truncate max-w-30"
                      title={`${row.hospital_city}, ${row.hospital_state}`}
                    >
                      {row.hospital_city
                        ? `${row.hospital_city}, ${row.hospital_state}`
                        : "--"}
                    </TableCell>
                    <TableCell
                      className="truncate max-w-62.5"
                      title={row.description}
                    >
                      {row.description || "--"}
                    </TableCell>
                    <TableCell className="truncate max-w-25" title={row.code}>
                      {row.code || "--"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {row.setting || "--"}
                    </TableCell>
                    <TableCell
                      className="capitalize truncate max-w-30"
                      title={row.billing_class}
                    >
                      {row.billing_class || "--"}
                    </TableCell>
                    <TableCell
                      className="truncate max-w-37.5"
                      title={row.payer_name}
                    >
                      {row.payer_name || "--"}
                    </TableCell>
                    <TableCell
                      className="truncate max-w-37.5"
                      title={row.plan_name}
                    >
                      {row.plan_name || "--"}
                    </TableCell>
                    <TableCell
                      className="capitalize truncate max-w-30"
                      title={row.payer_type}
                    >
                      {row.payer_type || "--"}
                    </TableCell>

                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.gross_charge)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.discounted_cash)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.minimum)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.maximum)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.standard_charge_dollar)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.estimated_amount)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-700 font-bold bg-emerald-50/50">
                      {formatCurrency(row.negotiated_rate)}
                    </TableCell>

                    <TableCell
                      className="truncate max-w-50"
                      title={row.methodology}
                    >
                      {row.methodology || "--"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-slate-500">Showing top 15 results.</p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={data.length < 15 || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
