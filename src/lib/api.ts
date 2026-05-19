import { apiRequest, apiRequestEnvelope } from "./apiClient";

export type UserRole = "ADMIN" | "OPERATOR" | "USER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  token: { accessToken: string; tokenType: string; expiresIn: number };
  user: AuthUser;
}

export type LoanStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LoanRequester {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface LoanResource {
  id: string;
  amountCents: number;
  uf: string;
  productType: string | null;
  status: LoanStatus;
  requesterId: string | null;
  requester: LoanRequester | null;
  forced: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface UserResource {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export type ConcentrationStatus = "OK" | "WARNING" | "BREACH";

export interface StateConcentration {
  uf: string;
  totalCents: number;
  loanCount: number;
  share: number;
  limit: number;
  headroomCents: number;
  status: ConcentrationStatus;
}

export interface PolicyDescriptor {
  scope: "DEFAULT" | "UF";
  uf: string | null;
  limitFraction: number;
}

export interface ConcentrationReport {
  grandTotalCents: number;
  totalLoans: number;
  states: StateConcentration[];
  policy: PolicyDescriptor[];
}

export interface ConcentrationRule {
  id: string;
  scope: "DEFAULT" | "UF";
  uf: string | null;
  limitFraction: number;
  productType: string | null;
  active: boolean;
}

export interface LoanInput {
  amount: number;
  uf: string;
  productType?: string;
  force?: boolean;
  requesterId?: string;
}

export interface LoanPage {
  items: LoanResource[];
  total: number;
  page: number;
  pageSize: number;
}

export const login = (email: string, password: string): Promise<LoginResult> =>
  apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (input: {
  name: string;
  email: string;
  password: string;
  amount: number;
  uf: string;
  productType?: string;
}): Promise<LoginResult> =>
  apiRequest<LoginResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateProfile = (changes: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<AuthUser> =>
  apiRequest<AuthUser>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(changes),
  });

export const createLoan = (input: LoanInput): Promise<LoanResource> =>
  apiRequest<LoanResource>("/loans", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateLoan = (
  id: string,
  input: LoanInput,
): Promise<LoanResource> =>
  apiRequest<LoanResource>(`/loans/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const deleteLoan = (id: string): Promise<void> =>
  apiRequest<void>(`/loans/${id}`, { method: "DELETE" });

export interface LoanListFilters {
  uf?: string;
  productType?: string;
  createdFrom?: string;
  createdTo?: string;
}

const fetchLoanPage = async (
  path: string,
  params: URLSearchParams,
): Promise<LoanPage> => {
  const envelope = await apiRequestEnvelope<LoanResource[]>(
    `${path}?${params.toString()}`,
  );
  return {
    items: envelope.data,
    total: envelope.meta?.total ?? envelope.data.length,
    page: envelope.meta?.page ?? 1,
    pageSize: envelope.meta?.pageSize ?? envelope.data.length,
  };
};

export const listLoans = (
  page = 1,
  pageSize = 8,
  filters: LoanListFilters = {},
): Promise<LoanPage> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (filters.uf) {
    params.set("uf", filters.uf);
  }
  if (filters.productType) {
    params.set("productType", filters.productType);
  }
  if (filters.createdFrom) {
    params.set("createdFrom", filters.createdFrom);
  }
  if (filters.createdTo) {
    params.set("createdTo", filters.createdTo);
  }
  return fetchLoanPage("/loans", params);
};

export const listRequests = (page = 1, pageSize = 8): Promise<LoanPage> =>
  fetchLoanPage(
    "/requests",
    new URLSearchParams({ page: String(page), pageSize: String(pageSize) }),
  );

export const approveRequest = (
  id: string,
  force = false,
): Promise<LoanResource> =>
  apiRequest<LoanResource>(`/requests/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ force }),
  });

export const rejectRequest = (id: string): Promise<LoanResource> =>
  apiRequest<LoanResource>(`/requests/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({}),
  });

export const createRequest = (input: {
  amount: number;
  uf: string;
  productType?: string;
}): Promise<LoanResource> =>
  apiRequest<LoanResource>("/requests", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const listMyLoans = (): Promise<LoanResource[]> =>
  apiRequest<LoanResource[]>("/loans/mine");

export const listClients = (): Promise<UserResource[]> =>
  apiRequest<UserResource[]>("/clients");

export const createClient = (input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserResource> =>
  apiRequest<UserResource>("/clients", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getConcentration = (): Promise<ConcentrationReport> =>
  apiRequest<ConcentrationReport>("/dashboard/concentration");

export const listRules = (): Promise<ConcentrationRule[]> =>
  apiRequest<ConcentrationRule[]>("/admin/concentration-rules");

export const createRule = (input: {
  scope: "DEFAULT" | "UF";
  uf?: string | null;
  limitFraction: number;
}): Promise<ConcentrationRule> =>
  apiRequest<ConcentrationRule>("/admin/concentration-rules", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateRule = (
  id: string,
  changes: { limitFraction?: number; active?: boolean },
): Promise<ConcentrationRule> =>
  apiRequest<ConcentrationRule>(`/admin/concentration-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });

export const deleteRule = (id: string): Promise<void> =>
  apiRequest<void>(`/admin/concentration-rules/${id}`, { method: "DELETE" });

export const listUsers = (): Promise<UserResource[]> =>
  apiRequest<UserResource[]>("/admin/users");

export const createUser = (input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<UserResource> =>
  apiRequest<UserResource>("/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateUser = (
  id: string,
  changes: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    active?: boolean;
  },
): Promise<UserResource> =>
  apiRequest<UserResource>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });

export const deleteUser = (id: string): Promise<void> =>
  apiRequest<void>(`/admin/users/${id}`, { method: "DELETE" });
