import { ISalesLead } from "../sales/i-sales-lead";

export interface ILeadEmployeeReport {
    employeeId: string;
    employeeName: string;
    totalAssignedLeads: number;
    meetingAgreedCount: number;
    quotationSentCount: number;
    dealCount: number;
    leads: ISalesLead[];
}
