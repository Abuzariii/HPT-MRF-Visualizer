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
  hospital_name: string;
  description: string;
  code: string; // Combined MS-DRG, CPT, HCPCS
  payer_name: string;
  plan_name: string;
  payer_group: string;
  payer_type: string;
  setting: string;
  discounted_cash: number | null;
  negotiated_rate: number | null; // Standard charge dollar OR estimated amount
  methodology: string;
}
