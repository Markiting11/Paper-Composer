
export interface ExamPaperData {
  title: string;
  subject: string;
  totalMarks: string;
  timeAllowed: string;
  sections: ExamSection[];
}

export interface ExamSection {
  title: string;
  instructions?: string;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  number: string;
  text: string;
  marks?: string;
  subQuestions?: string[];
}

export enum AppState {
  AUTH = 'AUTH',
  LANDING = 'LANDING',
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  EDITOR = 'EDITOR',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export interface UploadedFile {
  file: File;
  preview: string;
}

export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}
