export interface ISalesLead {
  id: number;
  businessName: string;
  whatsAppNumber: string;
  country?: string;
  occupation?: string;
  contactStatus: ContactStatus;
  currentLeadStatus: CurrentLeadStatus;
  leadSource: LeadSource;
  interestLevel: InterestLevel;
  freelancePlatform?: FreelancePlatform;
  responsibility: LeadResponsibility;
  servicesInterestedIn: ILeadServicesDTO[];
  meetingDate?: Date;
  quotationSent: boolean;
  followUpTime?: Date;
  salesRepId?: string;
  salesRepName?: string;
  createdById: string;
  createdByName: string;
  createdAt: Date;
  updatedAt?: Date;
  notes: ILeadNote[];
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
  country?: string;
  occupation?: string;
  contactStatus: ContactStatus;
  currentLeadStatus: CurrentLeadStatus;
  leadSource: LeadSource;
  interestLevel: InterestLevel;
  freelancePlatform?: FreelancePlatform;
  responsibility: LeadResponsibility;
  servicesInterestedIn: ICreateLeadService[];
  meetingDate?: Date;
  quotationSent: boolean;
  followUpTime?: Date;
  salesRepId?: string;
  createdById: string;
  notes?: ICreateLeadNote[];
}

export interface ICreateLeadService {
  serviceId: number;
  leadId?: number;
}

export interface ICreateLeadNote {
  note: string;
  leadId: number;
}

export enum ContactStatus {
  NotContactedYet = 0,
  ContactedWithNoReply = 1,
  ContactedAndReplied = 2,
  WrongNumber = 3,
}

export enum CurrentLeadStatus {
  NewLead = 0,
  FirstCall = 1,
  Interested = 2,
  MeetingAgreed = 3,
  Potential = 4,
  Deal = 5,
  NotPotential = 6,
}

export enum LeadSource {
  Facebook = 0,
  Instagram = 1,
  LinkedIn = 2,
  Referral = 3,
  GoogleMaps = 4,
  Website = 5,
  FreelancingPlatforms = 6,
}

export enum InterestLevel {
  Cold = 0,
  Warm = 1,
  Hot = 2,
}

export enum LeadResponsibility {
  Responsible_DecisionMaker = 0,
  Responsible_NOT_DecisionMaker = 1,
  NotResponsible = 2,
}

export enum FreelancePlatform {
  Bahr = 0,
  Upwork = 1,
}

export enum LeadBudget {
  Below = 0,
  Equal = 1,
  Higher = 2,
}

export enum LeadTimeline {
  Below = 0,
  Equal = 1,
  Higher = 2,
}

export enum NeedsExpectation {
  Below = 0,
  Equal = 1,
  Higher = 2,
}

export interface IUpdateLead {
  id: number;
  businessName?: string;
  whatsAppNumber?: string;
  country?: string;
  occupation?: string;
  contactStatus?: ContactStatus;
  currentLeadStatus?: CurrentLeadStatus;
  leadSource?: LeadSource;
  interestLevel?: InterestLevel;
  freelancePlatform?: FreelancePlatform;
  responsibility?: LeadResponsibility;
  servicesInterestedIn?: number[];
  meetingDate?: Date;
  quotationSent?: boolean;
  followUpTime?: Date;
  salesRepId?: string;
}

export interface IUpdateLeadService {
  serviceId: number;
  leadId?: number;
}

/** Note returned by GET leads/notes/{leadId} */
export interface ILeadNote {
  id: number;
  note: string;
  createdById: string;
  createdByName: string;
  leadId: number;
  createdAt: Date;
}
