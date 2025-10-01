const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_EMAIL = (import.meta.env.VITE_API_EMAIL as string | undefined) ?? "admin@example.com";
const API_PASSWORD = (import.meta.env.VITE_API_PASSWORD as string | undefined) ?? "admin123";
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined)?.toLowerCase() === "true" || true;

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
  if (USE_MOCK) {
    throw new Error("api() should not be called in mock mode");
  }
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

// -----------------------------
// Mock helpers
// -----------------------------
import { useStore } from "./store";

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUserInitialsFromStore(): string {
  const { user } = useStore.getState();
  const name = user?.name?.trim() || "";
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  const email = user?.email || "";
  if (email.includes("@")) return email.split("@")[0].slice(0, 2).toUpperCase();
  return "XX";
}

function formatDateDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function buildFormattedNumbersById(): Record<string, string> {
  const { quotations } = useStore.getState();
  const initials = getUserInitialsFromStore();
  const byDate: Record<string, { id: string; createdAt: string }[]> = {};
  quotations.forEach((q) => {
    const dateKey = new Date(q.createdAt).toISOString().slice(0, 10);
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push({ id: q.id, createdAt: q.createdAt });
  });
  const result: Record<string, string> = {};
  Object.entries(byDate).forEach(([dateKey, list]) => {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    list.forEach((item, idx) => {
      const date = new Date(dateKey);
      const seq = String(idx + 1).padStart(2, "0");
      result[item.id] = `${initials}${formatDateDDMMYYYY(date)}-${seq}`;
    });
  });
  return result;
}

// Auth
export async function login(email: string, password: string) {
  if (USE_MOCK) {
    await delay();
    // Accept any credentials in mock mode
    setAuthToken("mock-token");
    return;
  }
  const data = await api<{ token: string }>(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
}

// Clients
export async function getClients(): Promise<UIClient[]> {
  if (USE_MOCK) {
    await delay();
    const { clients } = useStore.getState();
    return clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? null,
      phone: c.phone ?? null,
      company: c.company ?? null,
      address: c.address ?? null,
      createdAt: c.createdAt,
    }));
  }
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
  if (USE_MOCK) {
    await delay();
    const { deleteClient } = useStore.getState();
    deleteClient(id);
    return;
  }
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
  if (USE_MOCK) {
    await delay();
    const { addClient, clients } = useStore.getState();
    addClient({
      name: input.name,
      email: input.email ?? "",
      phone: input.phone ?? "",
      address: input.address ?? "",
      company: input.company ?? undefined,
    });
    const created = useStore.getState().clients[useStore.getState().clients.length - 1];
    return {
      id: created.id,
      name: created.name,
      email: created.email ?? null,
      phone: created.phone ?? null,
      company: created.company ?? null,
      address: created.address ?? null,
      createdAt: created.createdAt,
    };
  }
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
  if (USE_MOCK) {
    await delay();
    const { updateClient, clients } = useStore.getState();
    updateClient(id, {
      name: input.name,
      email: input.email ?? "",
      phone: input.phone ?? "",
      address: input.address ?? "",
      company: input.company ?? undefined,
    });
    const updated = useStore.getState().clients.find((c) => c.id === id)!;
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email ?? null,
      phone: updated.phone ?? null,
      company: updated.company ?? null,
      address: updated.address ?? null,
      createdAt: updated.createdAt,
    };
  }
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
  if (USE_MOCK) {
    await delay();
    const { quotations } = useStore.getState();
    const numberById = buildFormattedNumbersById();
    return quotations.map((q) => ({
      id: q.id,
      quotationNumber: numberById[q.id] || q.quotationNumber,
      clientId: q.clientId,
      clientName: q.clientName,
      status: q.status as UIQuotation["status"],
      total: q.total,
      validUntil: q.validUntil,
      createdAt: q.createdAt,
    }));
  }
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
  if (USE_MOCK) {
    await delay();
    const { deleteQuotation } = useStore.getState();
    deleteQuotation(id);
    return;
  }
  await api<void>(`/api/quotations/${id}`, { method: "DELETE" });
}

// Reports
export async function getDashboardStats(): Promise<{ totalRevenue: number; totalQuotations: number; totalClients: number }> {
  if (USE_MOCK) {
    await delay();
    const { quotations, clients } = useStore.getState();
    const totalRevenue = quotations.reduce((sum, q) => sum + Number(q.total || 0), 0);
    return {
      totalRevenue,
      totalQuotations: quotations.length,
      totalClients: clients.length,
    };
  }
  const data = await api<{ stats: { clients: number; quotations: number; totalRevenue: any } }>(`/api/reports/dashboard`);
  return {
    totalRevenue: decimalToNumber(data.stats.totalRevenue),
    totalQuotations: data.stats.quotations,
    totalClients: data.stats.clients,
  };
}

export async function getRecentQuotations(): Promise<UIQuotation[]> {
  if (USE_MOCK) {
    await delay();
    const { quotations } = useStore.getState();
    const numberById = buildFormattedNumbersById();
    const sorted = [...quotations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.slice(0, 5).map((q) => ({
      id: q.id,
      quotationNumber: numberById[q.id] || q.quotationNumber,
      clientId: q.clientId,
      clientName: q.clientName,
      status: q.status as UIQuotation["status"],
      total: q.total,
      validUntil: q.validUntil,
      createdAt: q.createdAt,
    }));
  }
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


