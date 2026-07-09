export interface BatchSummary {
  id: string;
  name: string;
  schedule: string;
  facultyName: string | null;
  capacity: number | null;
  startDate: string | null;
  studentCount: number;
  seatsLeft: number | null;
}

export interface CourseSummary {
  id: string;
  name: string;
  fees: number;
  duration: string;
  studentCount: number;
  batches: BatchSummary[];
}

export interface CourseFormValues {
  name: string;
  fees: number;
  duration: string;
}

export interface BatchFormValues {
  name: string;
  schedule: string;
  facultyName: string;
  capacity: string; // form input as string, coerced server-side
  startDate: string;
}
