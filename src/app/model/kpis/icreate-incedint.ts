export interface ICreateIncedint {
  employeeId: string;
  aspect: KPIAspect;
  description?: string;
  evidenceURL?: string;
}

export interface IKpiSummary {
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  monthLabel: string;
  commitment: number;
  productivity: number;
  qualityOfWork: number;
  cooperation: number;
  customerSatisfaction: number;
  total: number;
}

export interface IIncedint {
  id: number;
  employeeId: string;
  employeeName: string;
  aspect: number;
  timeStamp: string;
  penaltyPercentage: number;
  description?: string;
  evidenceURL?: string;
}

export enum KPIAspect {
  Commitment = 1,
  Cooperation = 2,
  Productivity = 3,
  CustomerSatisfaction = 4,
  QualityOfWork = 5,
}
