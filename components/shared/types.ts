export interface SchoolYear {
  id: number;
  name: string;
  start_year: number;
  end_year: number;
  is_active: boolean;
}

export interface AcademicScore {
  id: number;
  score_type: string;
  label: string;
  value: number | null;
  note: string | null;
  school_year_id: number;
}

export interface Assignment {
  id: number;
  assignment_role: "HUYNH_TRUONG" | "DU_TRUONG" | "SOUR";
  user: {
    id: number;
    full_name: string;
    role: string;
  };
  schoolYear?: { id: number; name: string };
}

export interface StudentHocBa {
  id: string;
  full_name: string;
  saint_name: string;
  class_name: string;
  nganh: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  parent_father_name: string | null;
  parent_father_phone: string | null;
  parent_mother_name: string | null;
  parent_mother_phone: string | null;
  scores: AcademicScore[];
  assignments: Assignment[];
}

export type Tab = "info" | "scores" | "assignments";
