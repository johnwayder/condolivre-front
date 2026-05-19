"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import BrandLogo from "@/components/BrandLogo";

interface LoginForm {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email("E-mail inválido").required("Informe o e-mail"),
  password: yup.string().required("Informe a senha"),
});

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    setFormError(null);
    try {
      const user = await signIn(data.email, data.password);
      router.push(user.role === "USER" ? "/my-requests" : "/dashboard");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível entrar. Tente novamente.",
      );
    }
  };

  return (
    <main className="cl-auth">
      <section className="cl-auth-hero">
        <div className="cl-brand mb-4 text-white">CondoLivre</div>
        <div className="cl-auth-underline mb-4" />
        <h1 className="fw-bold display-6 mb-3">
          Crédito rápido e fácil para o universo dos condomínios
        </h1>
        <p className="fs-5 opacity-75 mb-4">
          Consignado, empréstimo para o condomínio ou antecipação de recebíveis
          — solicite 100% online, em poucos minutos.
        </p>
        <Link href="/onboarding" className="cl-hero-cta">
          Quero solicitar um empréstimo
          <ArrowRight size={20} />
        </Link>
      </section>

      <section className="cl-auth-form">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <BrandLogo height={34} className="mb-4" />
          <p className="text-secondary mb-4">Entre com suas credenciais.</p>

          {formError && (
            <div className="alert alert-danger py-2" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="voce@condolivre.com.br"
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="cl-login-cta mt-4">
            <div className="flex-grow-1">
              <strong className="d-block">Quer contratar um empréstimo?</strong>
              <span className="small text-secondary">
                Crie sua conta e envie sua solicitação de crédito.
              </span>
            </div>
            <Link
              href="/onboarding"
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
            >
              Começar
              <ArrowRight size={15} />
            </Link>
          </div>

          <p className="text-secondary small mt-4 mb-0">
            Usuários de Demonstração <br />
            Admin: <br />
            <code>admin@condolivre.com.br</code> <br />
            <code>Admin@123</code>
          </p>
          <p className="text-secondary small mt-2 mb-0">
            Operador: <br />
            <code>operador@condolivre.com.br</code> <br />
            <code>Operador@123</code>
          </p>
          <p className="text-secondary small mt-2 mb-0">
            Cliente: <br />
            <code>cliente@condolivre.com.br</code> <br />
            <code>Cliente@123</code>
          </p>
        </div>
      </section>
    </main>
  );
}
