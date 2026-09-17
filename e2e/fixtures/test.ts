import { test as base } from "@playwright/test";
import { FoundationPage } from "../pages/foundation.page";
import { LoginPage } from "../pages/login.page";
import { RecoveryPage } from "../pages/recovery.page";
import { PasswordPage } from "../pages/password.page";
import { InvitationPage } from "../pages/invitation.page";
import { ProSpacePage } from "../pages/pro-space.page";
import { SupabaseFixture, type TestAccount } from "./supabase";

type Fixtures = {
  foundation: (port: 3000 | 3001) => FoundationPage;
  login: LoginPage;
  recovery: RecoveryPage;
  password: PasswordPage;
  invitation: InvitationPage;
  space: ProSpacePage;
  supabase: SupabaseFixture;
  recoveryAccount: TestAccount;
  loginAccount: TestAccount;
  adminAccount: TestAccount;
};
export const test = base.extend<Fixtures>({
  foundation: async ({ page }, provide) => {
    await provide((port) => new FoundationPage(page, port));
  },
  login: async ({ page }, provide) => {
    await provide(new LoginPage(page));
  },
  recovery: async ({ page }, provide) => {
    await provide(new RecoveryPage(page));
  },
  password: async ({ page }, provide) => {
    await provide(new PasswordPage(page));
  },
  invitation: async ({ page }, provide) => {
    await provide(new InvitationPage(page));
  },
  space: async ({ page }, provide) => {
    await provide(new ProSpacePage(page));
  },
  supabase: async ({}, provide, testInfo) => {
    await provide(new SupabaseFixture(testInfo.project.name));
  },
  recoveryAccount: async ({ supabase }, provide) => {
    await provide(await supabase.account("recovery"));
  },
  loginAccount: async ({ supabase }, provide) => {
    await provide(await supabase.account("login"));
  },
  adminAccount: async ({ supabase }, provide) => {
    await provide(await supabase.account("admin"));
  },
});
export { expect } from "@playwright/test";
