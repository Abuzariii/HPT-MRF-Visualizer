// src/types/index.ts
export interface SummaryStats {
  total_charges: number;
  distinct_hospitals: number;
  avg_gross: number;
}

export interface TopProcedure {
  description: string;
  avg_charge: number;
  frequency: number;
}

export interface SettingStat {
  setting: string;
  count: number;
  avg_charge: number;
}

export interface ComparisonRecord {
  description: string;
  gross_charge: number | null;
  discounted_cash: number | null;
  minimum: number | null;
  maximum: number | null;
  setting: string;
  hospital_name: string;
  hospital_city: string;
  hospital_state: string;
}
