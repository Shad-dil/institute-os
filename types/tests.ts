export interface CourseOption {
  id: string;
  name: string;
}

export interface TestSummary {
  id: string;
  name: string;
  courseName: string;
  testDate: string;
  maxMarks: number;
  totalStudents: number;
  marksEntered: number;
}

export interface TestResultRow {
  studentId: string;
  studentName: string;
  avatarInitials: string;
  studentPhone: string;
  parentPhone: string | null;
  marksObtained: number | null;
  percentage: number | null;
  rank: number | null;
}

export interface TestDetail {
  id: string;
  name: string;
  courseName: string;
  testDate: string;
  maxMarks: number;
  instituteName: string;
  results: TestResultRow[];
}
