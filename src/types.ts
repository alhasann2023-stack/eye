export interface HospitalSettings {
  id: number;
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  doctor_name: string;
  doctor_signature: string;
  stamp: string;
  footer_text: string;
  primary_color: string;
}

export interface Patient {
  id: number;
  file_number: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  created_at: string;
}

export interface EyeData {
  sph: string;
  cyl: string;
  axis: string;
  add: string;
  va: string;
  pd: string;
  prism: string;
  base: string;
  iop: string;
  cl_sph: string;
  cl_cyl: string;
}

export interface Examination {
  id: number;
  patient_id: number;
  date: string;
  od_sph: string;
  od_cyl: string;
  od_axis: string;
  od_add: string;
  od_va: string;
  od_pd: string;
  od_prism: string;
  od_base: string;
  od_iop: string;
  od_cl_sph: string;
  od_cl_cyl: string;
  os_sph: string;
  os_cyl: string;
  os_axis: string;
  os_add: string;
  os_va: string;
  os_pd: string;
  os_prism: string;
  os_base: string;
  os_iop: string;
  os_cl_sph: string;
  os_cl_cyl: string;
  diagnosis: string;
  recommendations: string;
  notes: string;
  has_amblyopia?: boolean;
  // Join fields
  patient_name?: string;
  age?: number;
  gender?: string;
  patient_phone?: string;
  patient_address?: string;
  file_number?: string;
}

export interface DiagnosticResult {
  condition: string;
  severity: 'Mild' | 'Moderate' | 'High' | 'Normal';
  recommendations: string[];
  description: string;
}
