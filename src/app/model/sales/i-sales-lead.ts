export interface ISalesLead {
  id: number;
  businessName: string;
  whatsAppNumber: string;
  contactAttempts: number;
  contactStatus: ContactStatus;
  leadSource: LeadSource;
  decisionMakerReached: boolean;
  interested: boolean;
  interestLevel: InterestLevel;
  servicesInterestedIn: ILeadServicesDTO[];
  meetingAgreed: boolean;
  meetingDate?: Date;
  meetingAttend: MeetingAttend;
  quotationSent: boolean;
  followUpTime?: Date;
  followUpReason: FollowUpReason;
  notes?: string;
  salesRepId?: string;
  salesRepName?: string;
  createdById: string;
  createdByName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ILeadServicesDTO {
  serviceId: number;
  serviceTitle: string;
  leadId: number;
  leadName: string;
}

export interface ICreateLead {
  businessName: string;
  whatsAppNumber: string;
  contactAttempts: number;
  contactStatus: ContactStatus;
  leadSource: LeadSource;
  decisionMakerReached: boolean;
  interested: boolean;
  interestLevel: InterestLevel;
  servicesInterestedIn: ICreateLeadService[];
  meetingAgreed: boolean;
  meetingDate?: Date;
  meetingAttend: MeetingAttend;
  quotationSent: boolean;
  followUpTime?: Date;
  followUpReason?: FollowUpReason;
  notes?: string;
  salesRepId?: string;
  createdById: string;
}

export interface ICreateLeadService {
  serviceId: number;
  leadId?: number;
}

export enum ContactStatus {
  NoReply = 0,
  Replied = 1,
  WrongNumber = 2,
}

export enum CurrentLeadStatus {
  NewLead = 0,
  Contacted = 1,
  Interested = 2,
  MeetingScheduled = 3,
  Closed = 4,
  FollowUpLater = 5,
}

export enum LeadSource {}

export enum InterestLevel {
  Cold = 0,
  Warm = 1,
  Hot = 2,
}

export enum MeetingAttend {
  Yes = 0,
  No = 1,
  Pending = 2,
}

export enum FollowUpReason {
  Later = 0,
  NoReply = 1,
  ReturnedAfterMonths = 2,
}

export interface IUpdateLead {
  id: number;
  businessName?: string;
  whatsAppNumber?: string;
  contactAttempts: number;
  contactStatus: ContactStatus;
  leadSource: LeadSource;
  decisionMakerReached: boolean;
  interested: boolean;
  interestLevel: InterestLevel;
  servicesInterestedIn: number[];
  meetingAgreed: boolean;
  meetingDate?: Date;
  meetingAttend: MeetingAttend;
  quotationSent: boolean;
  followUpTime?: Date;
  followUpReason: FollowUpReason;
  notes?: string;
  salesRepId?: string;
}

export interface IUpdateLeadService {
  serviceId: number;
  leadId?: number;
}
