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
  hospital_city: string;
  hospital_state: string;
  description: string;
  code: string;
  setting: string;
  billing_class: string;
  payer_name: string;
  plan_name: string;
  payer_group: string;
  payer_type: string;
  gross_charge: number | null;
  discounted_cash: number | null;
  minimum: number | null;
  maximum: number | null;
  standard_charge_dollar: number | null;
  estimated_amount: number | null;
  negotiated_rate: number | null;
  methodology: string;
}
