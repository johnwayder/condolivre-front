"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserManager from "@/components/UserManager";

export default function UsersPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (!isAdmin) {
    return <p className="text-secondary">Acesso restrito a administradores.</p>;
  }

  return <UserManager />;
}
