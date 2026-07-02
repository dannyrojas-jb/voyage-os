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
