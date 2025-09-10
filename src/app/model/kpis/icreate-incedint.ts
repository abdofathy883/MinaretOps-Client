export interface ICreateIncedint {
  employeeId: string;
  aspect: KPIAspect;
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
