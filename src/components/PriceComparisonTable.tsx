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
  ArrowUpDown,
} from "lucide-react";
import { ComparisonRecord } from "@/types";
import { useDebounce } from "@/lib/useDebounce";

export default function PriceComparisonTable() {
  const [data, setData] = useState<ComparisonRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("MRI"); // Default search to show immediate value
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/compare?q=${encodeURIComponent(debouncedSearch)}&page=${page}`
        );
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    }
    if (debouncedSearch) fetchData();
  }, [debouncedSearch, page]);

  const formatCurrency = (val: number | null) =>
    val
      ? `$${val.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "--";

  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Compare Procedure Costs</CardTitle>
        <CardDescription>
          Search for a treatment to find the most affordable facilities.
        </CardDescription>
        <div className="relative w-full max-w-lg mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="e.g., 'MRI Brain', 'X-Ray', 'Knee Replacement'..."
            className="pl-10 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        )}
        <div className="rounded-md border flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[30%]">Procedure</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead className="text-right">Gross Charge</TableHead>
                <TableHead className="text-right text-emerald-700 font-semibold">
                  Cash Price
                </TableHead>
                <TableHead className="text-right text-slate-500">
                  Min Negotiated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-slate-500"
                  >
                    Search for a procedure to compare prices.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      <div className="line-clamp-2" title={row.description}>
                        {row.description || "N/A"}
                      </div>
                      <span className="text-xs text-slate-500 capitalize">
                        {row.setting}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">
                        {row.hospital_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {row.hospital_city}, {row.hospital_state}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatCurrency(row.gross_charge)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-700 font-bold">
                      {formatCurrency(row.discounted_cash)}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatCurrency(row.minimum)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Showing top 10 results sorted by price.
          </p>
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
              disabled={data.length < 10 || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
