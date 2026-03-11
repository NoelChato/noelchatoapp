export interface Visitor {
  id: number;
  name: string;
  address: string;
  contact: string;
  purpose: string;
  personToVisit: string;
  date: string; // ISO date string
  timeIn: string; // HH:MM
  timeOut?: string; // HH:MM or undefined until checkout
}