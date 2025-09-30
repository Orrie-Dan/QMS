const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_EMAIL = (import.meta.env.VITE_API_EMAIL as string | undefined) ?? "admin@example.com";
const API_PASSWORD = (import.meta.env.VITE_API_PASSWORD as string | undefined) ?? "admin123";

export type UIClient = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  createdAt: string;
};

export type UIQuotation = {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  total: number;
  validUntil?: string | null;
  createdAt: string;
};

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("qms_token", token);
    else localStorage.removeItem("qms_token");
  }
}

function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("qms_token");
    if (saved) authToken = saved;
  }
  return authToken;
}

async function autoLoginIfConfigured(): Promise<boolean> {
  if (!API_EMAIL || !API_PASSWORD) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: API_EMAIL, password: API_PASSWORD }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { token?: string };
    if (data?.token) {
      setAuthToken(data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function ensureAuth() {
  if (getAuthToken()) return;
  await autoLoginIfConfigured();
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Ensure token present before request if endpoints need auth
  if (!path.startsWith("/api/auth")) {
    await ensureAuth();
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...(init?.headers as any) }, cache: "no-store" as RequestCache });
  if (res.status === 401 && !path.startsWith("/api/auth")) {
    // Try one-time auto login and retry
    const loggedIn = await autoLoginIfConfigured();
    if (loggedIn) {
      const retryHeaders: Record<string, string> = { "Content-Type": "application/json" };
      const newToken = getAuthToken();
      if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...retryHeaders, ...(init?.headers as any) }, cache: "no-store" as RequestCache });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Auth
export async function login(email: string, password: string) {
  const data = await api<{ token: string }>(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
}

// Clients
export async function getClients(): Promise<UIClient[]> {
  const data = await api<{ items: any[] }>(`/api/clients`);
  return data.items.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    address: c.address ?? null,
    createdAt: c.createdAt,
  }));
}

export async function deleteClient(id: string): Promise<void> {
  await api<void>(`/api/clients/${id}`, { method: "DELETE" });
}

export type UpsertClientInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
};

export async function createClient(input: UpsertClientInput): Promise<UIClient> {
  const c = await api<any>(`/api/clients`, { method: "POST", body: JSON.stringify(input) });
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    address: c.address ?? null,
    createdAt: c.createdAt,
  };
}

export async function updateClient(id: string, input: UpsertClientInput): Promise<UIClient> {
  const c = await api<any>(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(input) });
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    address: c.address ?? null,
    createdAt: c.createdAt,
  };
}

// Quotations
function decimalToNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toString" in value) return Number(String(value));
  return Number(value);
}

export async function getQuotations(): Promise<UIQuotation[]> {
  const data = await api<{ items: any[] }>(`/api/quotations`);
  return data.items.map((q) => ({
    id: q.id,
    quotationNumber: q.number,
    clientId: q.clientId,
    clientName: q.client?.name ?? "",
    status: String(q.status).toLowerCase(),
    total: decimalToNumber(q.total),
    validUntil: q.validUntil,
    createdAt: q.createdAt,
  }));
}

export async function deleteQuotation(id: string): Promise<void> {
  await api<void>(`/api/quotations/${id}`, { method: "DELETE" });
}

// Reports
export async function getDashboardStats(): Promise<{ totalRevenue: number; totalQuotations: number; totalClients: number }> {
  const data = await api<{ stats: { clients: number; quotations: number; totalRevenue: any } }>(`/api/reports/dashboard`);
  return {
    totalRevenue: decimalToNumber(data.stats.totalRevenue),
    totalQuotations: data.stats.quotations,
    totalClients: data.stats.clients,
  };
}

export async function getRecentQuotations(): Promise<UIQuotation[]> {
  const data = await api<{ recentQuotations: any[] }>(`/api/reports/dashboard`);
  return (data.recentQuotations || []).map((q) => ({
    id: q.id,
    quotationNumber: q.number,
    clientId: q.clientId,
    clientName: q.client?.name ?? "",
    status: String(q.status).toLowerCase(),
    total: decimalToNumber(q.total),
    validUntil: q.validUntil,
    createdAt: q.createdAt,
  }));
}


