const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_EMAIL = process.env.NEXT_PUBLIC_API_EMAIL || "admin@example.com";
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD || "admin123";

let authToken: string | null = null;

export type UIClient = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  createdAt: string;
};

export type UIQuotationItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
};

export type UIQuotation = {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  items?: UIQuotationItem[];
  subtotal?: number;
  taxRate?: number; // percent (0-100) for UI
  taxAmount?: number;
  total: number;
  validUntil?: string | null;
  createdAt: string;
  updatedAt?: string;
  notes?: string | null;
};

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("qms_token", token);
    else localStorage.removeItem("qms_token");
  }
}

function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
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
      cache: "no-store",
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

function decimalToNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toString" in value) return Number(String(value));
  return Number(value);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!path.startsWith("/api/auth")) {
    await ensureAuth();
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as any) },
    cache: "no-store",
  });
  if (res.status === 401 && !path.startsWith("/api/auth")) {
    const loggedIn = await autoLoginIfConfigured();
    if (loggedIn) {
      const retryHeaders: Record<string, string> = { "Content-Type": "application/json" };
      const newToken = getAuthToken();
      if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { ...retryHeaders, ...(init?.headers as any) },
        cache: "no-store",
      });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// --- Helpers for status normalization ---
function normalizeStatus(value: any): UIQuotation["status"] {
  const s = String(value).toLowerCase();
  if (s === "draft" || s === "sent" || s === "accepted" || s === "rejected" || s === "expired") {
    return s;
  }
  return "draft"; // fallback if backend sends something unexpected
}

// --- Clients ---
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

// --- Quotations ---
export async function getQuotations(): Promise<UIQuotation[]> {
  const data = await api<{ items: any[] }>(`/api/quotations`);
  return data.items.map((q) => ({
    id: q.id,
    quotationNumber: q.number,
    clientId: q.clientId,
    clientName: q.client?.name ?? "",
    status: normalizeStatus(q.status),
    total: decimalToNumber(q.total),
    validUntil: q.validUntil,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));
}

export async function getQuotationById(id: string): Promise<UIQuotation> {
  const q = await api<any>(`/api/quotations/${id}`);
  const items: UIQuotationItem[] = (q.items || []).map((it: any) => ({
    id: it.id,
    description: it.description,
    quantity: it.quantity,
    unitPrice: decimalToNumber(it.unitPrice),
    total: decimalToNumber(it.total),
  }));
  const subtotal = decimalToNumber(q.subtotal);
  const tax = decimalToNumber(q.tax);
  const total = decimalToNumber(q.total);
  const taxRate = subtotal > 0 ? (tax / subtotal) * 100 : 0;
  return {
    id: q.id,
    quotationNumber: q.number,
    clientId: q.clientId,
    clientName: q.client?.name ?? "",
    status: normalizeStatus(q.status),
    items,
    subtotal,
    taxRate,
    taxAmount: tax,
    total,
    validUntil: q.validUntil,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    notes: q.notes ?? null,
  };
}

export type UpsertQuotationInput = {
  clientId: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  notes?: string | null;
  validUntil?: string | null; // ISO date string (yyyy-mm-dd)
  taxRatePercent?: number; // 0-100
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
};

export async function createQuotation(input: UpsertQuotationInput): Promise<UIQuotation> {
  const payload = {
    clientId: input.clientId, // MUST be a real clientId (cuid from DB)
    status: input.status.toUpperCase(), // must be provided because DB enum has no default
    notes: input.notes ?? null,
    validUntil: input.validUntil ? new Date(input.validUntil).toISOString() : null,
    taxRate: (input.taxRatePercent ?? 0) / 100,
    items: input.items.map((it) => ({
      description: it.description, // must not be empty
      quantity: it.quantity,
      unitPrice: it.unitPrice, // must be >= 0
    })),
  };

  const q = await api<any>(`/api/quotations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return await getQuotationById(q.id);
}


export async function updateQuotation(id: string, input: UpsertQuotationInput): Promise<UIQuotation> {
  const payload = {
    clientId: input.clientId,
    status: input.status.toUpperCase(),
    notes: input.notes ?? null,
    validUntil: input.validUntil ? new Date(input.validUntil).toISOString() : null,
    taxRate: (input.taxRatePercent ?? 0) / 100,
    items: input.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  };
  await api<any>(`/api/quotations/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  return await getQuotationById(id);
}

export async function deleteQuotation(id: string): Promise<void> {
  await api<void>(`/api/quotations/${id}`, { method: "DELETE" });
}
