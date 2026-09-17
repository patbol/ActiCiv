import { createHash, randomUUID } from "node:crypto";

export function seedId(value: string) {
  const h = createHash("md5").update(value).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export type TestAccount = { email: string; password: string; id: string };
function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing E2E variable: ${name}`);
  return value;
}
// Node-side fixture only. Never passed to page.evaluate, cookies or application code.
export class SupabaseFixture {
  private readonly base = required("SUPABASE_URL");
  private readonly anon = required("SUPABASE_PUBLISHABLE_KEY");
  private readonly service = required("SUPABASE_SERVICE_ROLE_KEY");
  readonly password = required("ACTICIV_E2E_PASSWORD");
  readonly organizationNumber: 2 | 3;
  readonly role: "agent" | "supervisor";
  constructor(project: string) {
    if (new URL(this.base).hostname !== "127.0.0.1")
      throw new Error("E2E require local Supabase");
    if (!["desktop", "mobile"].includes(project))
      throw new Error("Assign an isolated seed lane for this project");
    this.organizationNumber = project === "desktop" ? 2 : 3;
    this.role = project === "desktop" ? "agent" : "supervisor";
  }
  private async request<T>(
    path: string,
    body: unknown,
    token = this.service,
    method = "POST",
  ): Promise<T> {
    const response = await fetch(this.base + path, {
      method,
      headers: {
        apikey: this.anon,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    // Avoid including tokens, passwords or Auth response payloads in errors.
    if (!response.ok)
      throw new Error(
        `E2E setup failed: ${method} ${path} HTTP ${response.status}`,
      );
    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  }
  async account(purpose: "recovery" | "login" | "admin"): Promise<TestAccount> {
    const n =
      purpose === "recovery"
        ? 1
        : purpose === "login"
          ? 3
          : this.organizationNumber;
    const role = purpose === "admin" ? "client_admin" : this.role;
    const account = {
      email: `${role}${n}@example.test`,
      password: this.password,
      id: seedId(`user-${n}-${role}`),
    };
    await this.request(
      `/auth/v1/admin/users/${account.id}`,
      { password: account.password },
      this.service,
      "PUT",
    );
    return account;
  }
  async recoveryToken(email: string) {
    const link = await this.request<{ hashed_token: string }>(
      "/auth/v1/admin/generate_link",
      { type: "recovery", email },
    );
    return link.hashed_token;
  }
  async invitationToken() {
    const admin = await this.account("admin");
    const session = await this.request<{ access_token: string }>(
      "/auth/v1/token?grant_type=password",
      { email: admin.email, password: admin.password },
      this.anon,
    );
    const suffix = randomUUID();
    const email = `browser-${suffix}@example.test`;
    const invitation = await this.request<{ id: string }>(
      "/rest/v1/rpc/reserve_invitation",
      {
        p_org: seedId(`org-${this.organizationNumber}`),
        p_email: email,
        p_role: "agent",
        p_services: [],
        p_key: suffix,
      },
      session.access_token,
    );
    const user = await this.request<{ id: string }>("/auth/v1/invite", {
      email,
    });
    await this.request("/rest/v1/rpc/mark_invitation_sent", {
      p_invitation: invitation.id,
      p_user: user.id,
    });
    const link = await this.request<{ hashed_token: string }>(
      "/auth/v1/admin/generate_link",
      { type: "invite", email },
    );
    return link.hashed_token;
  }
}
