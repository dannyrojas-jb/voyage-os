export type TripStatus = 'lead' | 'planning' | 'proposal_sent' | 'booked' | 'completed';
export type ProposalStatus = 'draft' | 'sent' | 'approved' | 'declined';
export type CommissionStatus = 'projected' | 'pending' | 'earned';

export interface Client {
  id: string;
  agent_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  agent_id: string;
  client_id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number | null;
  status: TripStatus;
  notes: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  agent_id: string;
  trip_id: string;
  title: string;
  content: string;
  status: ProposalStatus;
  public_token: string;
  created_at: string;
}

export interface Commission {
  id: string;
  agent_id: string;
  trip_id: string;
  amount: number;
  rate: number;
  status: CommissionStatus;
  created_at: string;
}

export type PlanId = 'starter' | 'pro' | 'agency';
export type SubStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type InvoiceStatus = 'paid' | 'open' | 'void';

export interface Subscription {
  id: string;
  agent_id: string;
  plan: PlanId;
  status: SubStatus;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  agent_id: string;
  number: string;
  description: string | null;
  amount: number;
  status: InvoiceStatus;
  issued_date: string;
  created_at: string;
}

export interface TripFlight {
  id: string;
  agent_id: string;
  trip_id: string;
  origin: string;
  destination: string;
  depart_date: string | null;
  airline: string | null;
  cabin: string | null;
  price: number | null;
  source: string | null;
  created_at: string;
}
