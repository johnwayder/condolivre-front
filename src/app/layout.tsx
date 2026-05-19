import type { Metadata } from "next";
import "@/assets/scss/main.scss";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "CondoLivre — Controle de Concentração",
  description:
    "Monitoramento do risco de concentração geográfica da carteira de empréstimos da CondoLivre.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
