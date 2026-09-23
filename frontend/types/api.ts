export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  status: "active" | "inactive" | "blocked";
  address: string;
  city: string;
  notes: string;
  tenant: string;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  name: string;
  species: "DOG" | "CAT" | "BIRD" | "OTHER";
  breed: string;
  gender: "MALE" | "FEMALE";
  birth_date: string | null;
  weight: string | null;
  color: string;
  microchip: string;
  neutered: boolean | null;
  notes: string;
  is_active: boolean;
  owner: string;
  owner_name: string;
  tenant: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
  is_active: boolean;
  tenant: string;
}

export interface Appointment {
  id: string;
  pet: string;
  pet_name: string;
  owner: string;
  owner_name: string;
  service: string;
  service_name: string;
  start_time: string;
  end_time: string | null;
  status: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  notes: string;
  tenant: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  tenant: string;
}

export interface Brand {
  id: string;
  name: string;
  website: string;
  tenant: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  category_name: string;
  brand: string | null;
  brand_name: string;
  quantity: number;
  minimum_stock: number;
  cost_price: string;
  sale_price: string;
  expiration_date: string | null;
  description: string;
  is_active: boolean;
  tenant: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient: string | null;
  recipient_email: string | null;
  channel: "EMAIL" | "WHATSAPP" | "SYSTEM";
  subject: string;
  body: string;
  html_body: string;
  status: "PENDING" | "SENT" | "FAILED";
  error_message: string;
  tenant: string;
  created_at: string;
  sent_at: string | null;
}

// ===== Planos =====
export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  plan_type: "FREE" | "BRONZE" | "SILVER" | "GOLD";
  price_monthly: string;
  price_yearly: string;
  max_users: number;
  max_pets: number;
  max_appointments_month: number;
  max_products: number;
  max_ai_predictions_month: number;
  has_ai_churn: boolean;
  has_ai_forecast: boolean;
  has_reports: boolean;
  has_api_access: boolean;
  has_whatsapp: boolean;
  has_custom_domain: boolean;
  trial_days: number;
  order: number;
  is_active: boolean;
  is_public: boolean;
  is_free: boolean;
}

export interface Subscription {
  id: string;
  plan: Plan;
  plan_slug: string;
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  trial_start: string | null;
  trial_end: string | null;
  trial_days_remaining: number;
  current_period_start: string;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}
