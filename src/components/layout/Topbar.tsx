"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, UserCog } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useModals } from "@/context/ModalsContext";

const pageInfo = (pathname: string): { title: string; subtitle: string } => {
  if (pathname.startsWith("/my-requests")) {
    return {
      title: "Minhas solicitações",
      subtitle: "Acompanhe o andamento dos seus pedidos",
    };
  }
  if (pathname.startsWith("/requests")) {
    return {
      title: "Solicitações",
      subtitle: "Fila de análise de pedidos de clientes",
    };
  }
  if (pathname.startsWith("/loans")) {
    return {
      title: "Empréstimos",
      subtitle: "Carteira de operações aprovadas",
    };
  }
  if (pathname.startsWith("/users")) {
    return { title: "Usuários", subtitle: "Gestão de acessos ao portal" };
  }
  return {
    title: "Painel de risco de concentração",
    subtitle: "Relatórios da carteira e gestão de limites",
  };
};

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { openProfile } = useModals();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const { title, subtitle } = pageInfo(pathname);

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <header className="cl-topbar">
      <button
        type="button"
        className="btn btn-sm btn-light cl-topbar-menu"
        onClick={onMenu}
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      <div className="cl-topbar-title">
        <h1 className="h6 fw-bold mb-0">{title}</h1>
        <span className="small text-secondary d-none d-sm-block">
          {subtitle}
        </span>
      </div>

      <div className="cl-topbar-user" ref={menuRef}>
        <button
          type="button"
          className="cl-avatar-button"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="cl-avatar">{initialsOf(user?.name ?? "?")}</span>
          <span className="d-none d-md-flex flex-column text-start lh-1">
            <span className="fw-semibold small">{user?.name}</span>
            <span className="text-secondary" style={{ fontSize: "0.72rem" }}>
              {user?.role}
            </span>
          </span>
          <ChevronDown size={16} className="text-secondary" />
        </button>

        {menuOpen && (
          <div className="cl-dropdown">
            <button
              type="button"
              className="cl-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                openProfile();
              }}
            >
              <UserCog size={16} />
              Meus dados
            </button>
            <button
              type="button"
              className="cl-dropdown-item text-danger"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
