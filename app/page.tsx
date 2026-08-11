import { requireDashboardAuthentication } from "./auth";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireDashboardAuthentication();
  return <Dashboard />;
}
