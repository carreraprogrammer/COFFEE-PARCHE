export interface Partner {
  id: string;
  name: string;
  partnerType: string;
  neighborhood: string | null;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  active: boolean;
}
