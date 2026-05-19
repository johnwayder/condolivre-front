"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useModals } from "@/context/ModalsContext";
import BrandLogo from "@/components/BrandLogo";

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export default function Sidebar({ open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isStaff } = useAuth();
  const { openNewLoan, openNewRequest, openRules } = useModals();

  const navLink = (
    href: string,
    label: string,
    Icon: typeof LayoutDashboard,
  ) => (
    <Link
      href={href}
      className={`cl-sidebar-link ${pathname === href ? "active" : ""}`}
      onClick={onNavigate}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  const actionButton = (
    label: string,
    Icon: typeof LayoutDashboard,
    onClick: () => void,
  ) => (
    <button
      type="button"
      className="cl-sidebar-link"
      onClick={() => {
        onClick();
        onNavigate();
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <aside className={`cl-sidebar ${open ? "open" : ""}`}>
      <div className="cl-sidebar-header">
        <BrandLogo height={22} />
        <div className="small text-secondary">Risco de concentração</div>
      </div>

      <nav className="cl-sidebar-nav">
        {isStaff ? (
          <>
            <span className="cl-sidebar-section">Navegação</span>
            {navLink("/dashboard", "Dashboard", LayoutDashboard)}
            {navLink("/loans", "Empréstimos", ListChecks)}
            {navLink("/requests", "Solicitações", ClipboardList)}

            <span className="cl-sidebar-section">Ações</span>
            {actionButton("Novo empréstimo", PlusCircle, openNewLoan)}
            {isAdmin &&
              actionButton(
                "Limites de concentração",
                SlidersHorizontal,
                openRules,
              )}

            {isAdmin && (
              <>
                <span className="cl-sidebar-section">Administração</span>
                {navLink("/users", "Usuários", Users)}
              </>
            )}
          </>
        ) : (
          <>
            <span className="cl-sidebar-section">Minha conta</span>
            {navLink("/my-requests", "Minhas solicitações", FileText)}

            <span className="cl-sidebar-section">Ações</span>
            {actionButton("Nova solicitação", PlusCircle, openNewRequest)}
          </>
        )}
      </nav>
    </aside>
  );
}
