export interface LeadImportResult {
  totalRows: number;
  successCount: number;
  createdCount: number;
  updatedCount: number;
  failedCount: number;
  skippedCount: number;
  errors: LeadImportRowError[];
}

export interface LeadImportRowError {
  rowNumber: number;
  businessName: string;
  whatsAppNumber: string;
  errorMessage: string;
}
