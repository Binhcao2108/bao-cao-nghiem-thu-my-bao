export interface ReportData {
  id: string;
  contract: string;
  scenario: string;
  band: string;
  technician: string;
  province: string;
  region: string;
  status: string;
  duration: string;
  dateCreated: string;
  originalRow: Record<string, any>;
}

export interface FilterState {
  region: string[];
  province: string[];
  scenario: string[];
  technician: string[];
  status: string[];
  searchQuery: string;
}
