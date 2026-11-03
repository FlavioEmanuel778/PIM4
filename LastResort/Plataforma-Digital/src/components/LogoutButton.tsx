"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
    router.replace("/login"); router.refresh();
  }
  return <button type="button" className="logout" onClick={logout}><LogOut aria-hidden />Sair</button>;
}
