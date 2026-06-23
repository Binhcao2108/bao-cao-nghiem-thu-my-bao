export interface ReportData {
  id: string;
  contract: string;
  scenario: string;
  band: string;
  technician: string;
  province: string;
  status: string;
  duration: string;
  dateCreated: string;
  originalRow: Record<string, any>;
}

export interface FilterState {
  province: string[];
  scenario: string[];
  technician: string[];
  status: string[];
  searchQuery: string;
}
