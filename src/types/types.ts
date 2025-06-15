export type AccidentReport = {
  id: number;
  accident_time: string;
  created_at: string;
  updated_at: string;
  caller_phone_number: string;
  description: string;
  is_active: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  severity: string;
  latitude: string;
  longitude: string;
  address: string;
  reference_point: string;
  type_place: number;
  people_involved: number;
  additional_notes: string;
  assigned_ambulance_user_id: number | null;
  assigned_ambulance: any;
};

export type AmbulanceInfo = {
  id: any;
  plate_number: string;
  ambulance_type: string;
  status: string;
  capacity: number;
  last_inspection_date: string;
  latitude: string;
  longitude: string;
  address: string;
  created_at: string;
  user: number;
  assigned_hospital: string | null;
  is_recommended?: boolean;
};