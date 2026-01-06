export interface ISalaryPeriod {
    id: number;
  employeeId: string;
  employeeName: string;
  monthLabel: string;
  month: number;
  year: number;
  salary: number;
  bonus: number;
  deductions: number;
  dueAmount: number;
  totalPaidAmount: number;
  remainingAmount: number;
  salaryPayments: ISalaryPayment[];
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

export interface ISalaryPayment {
  id: number;
  employeeId: string;
  employeeName: string;
  salaryPeriodId?: number;
  amount: number;
  notes?: string;
  createdAt: Date;
}

export interface ICreateSalaryPayment {
  employeeId: string;
  salaryPeriodId?: number;
  amount: number;
  notes?: string;
}

export interface ICreateSalaryPeriod {
  employeeId: string;
  salary: number;
  bonus: number;
  deductions: number;
  salaryPayments: ICreateSalaryPayment[];
  notes: string;
  createdAt: Date;
}
