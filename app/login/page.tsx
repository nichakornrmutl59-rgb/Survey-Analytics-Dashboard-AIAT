import { redirect } from "next/navigation";
import { isDashboardAuthenticated } from "../auth";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isDashboardAuthenticated()) redirect("/");
  return <LoginForm />;
}
