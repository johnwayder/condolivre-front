"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Check } from "lucide-react";
import { register as registerClient } from "@/lib/api";
import { ApiError, storeToken } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { BRAZILIAN_STATES } from "@/lib/brazilianStates";
import { LOAN_PRODUCTS } from "@/lib/loanProducts";
import BrandLogo from "@/components/BrandLogo";
import CurrencyField from "@/components/ui/CurrencyField";

interface OnboardingValues {
  name: string;
  email: string;
  productType: string;
  amount: number;
  uf: string;
  password: string;
  passwordConfirm: string;
}

const STEPS: { title: string; fields: (keyof OnboardingValues)[] }[] = [
  { title: "Seus dados", fields: ["name", "email"] },
  { title: "Seu empréstimo", fields: ["productType", "amount", "uf"] },
  { title: "Sua conta", fields: ["password", "passwordConfirm"] },
];

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Informe seu nome")
    .required("Informe seu nome"),
  email: yup
    .string()
    .trim()
    .email("E-mail inválido")
    .required("Informe o e-mail"),
  productType: yup.string().required("Escolha um serviço"),
  amount: yup
    .number()
    .typeError("Informe o valor")
    .positive("O valor deve ser maior que zero")
    .required("Informe o valor"),
  uf: yup.string().required("Selecione o estado"),
  password: yup
    .string()
    .min(6, "Mínimo de 6 caracteres")
    .required("Crie uma senha"),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não conferem")
    .required("Confirme a senha"),
});

export default function OnboardingPage() {
  const router = useRouter();
  const { applyUser } = useAuth();
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const selectedProduct = watch("productType");

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields);
    if (valid) {
      setStep((current) => Math.min(STEPS.length - 1, current + 1));
    }
  };

  const onSubmit = async (values: OnboardingValues) => {
    setApiError(null);
    try {
      const result = await registerClient({
        name: values.name,
        email: values.email,
        password: values.password,
        amount: values.amount,
        uf: values.uf,
        productType: values.productType,
      });
      storeToken(result.token.accessToken);
      applyUser(result.user);
      router.push("/my-requests");
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível concluir o cadastro.",
      );
    }
  };

  return (
    <main className="cl-onboarding">
      <div className="cl-onboarding-card">
        <div className="text-center mb-4">
          <BrandLogo height={30} />
          <h1 className="h5 fw-bold mt-3 mb-1">
            Contrate um serviço CondoLivre
          </h1>
          <p className="text-secondary small mb-0">
            Crie sua conta e envie sua solicitação em poucos passos.
          </p>
        </div>

        <div className="cl-steps mb-4">
          {STEPS.map((item, index) => (
            <div key={item.title} className="cl-step">
              <span
                className={`cl-step-dot ${index === step ? "active" : ""} ${
                  index < step ? "done" : ""
                }`}
              >
                {index < step ? <Check size={14} /> : index + 1}
              </span>
              <span className="cl-step-label">{item.title}</span>
            </div>
          ))}
        </div>

        {apiError && (
          <div className="alert alert-danger" role="alert">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 0 && (
            <>
              <div className="mb-3">
                <label className="form-label" htmlFor="name">
                  Nome completo
                </label>
                <input
                  id="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  {...register("name")}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <label className="form-label fw-semibold">
                Selecione o tipo de empréstimo
              </label>
              <p className="small text-secondary mb-2">
                Todas as nossas soluções são linhas de crédito — escolha a que
                combina com você.
              </p>
              <div className="d-flex flex-column gap-2 mb-3">
                {LOAN_PRODUCTS.map((product) => (
                  <button
                    key={product.value}
                    type="button"
                    className={`cl-product-option ${
                      selectedProduct === product.value ? "selected" : ""
                    }`}
                    onClick={() =>
                      setValue("productType", product.value, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <span className="fw-semibold">{product.label}</span>
                    <span className="small text-secondary">
                      {product.description}
                    </span>
                  </button>
                ))}
              </div>
              {errors.productType && (
                <div className="text-danger small mb-2">
                  {errors.productType.message}
                </div>
              )}

              <div className="row g-3">
                <div className="col-sm-7">
                  <label className="form-label" htmlFor="amount">
                    Valor desejado
                  </label>
                  <CurrencyField
                    name="amount"
                    control={control}
                    id="amount"
                    invalid={Boolean(errors.amount)}
                  />
                  {errors.amount && (
                    <div className="text-danger small mt-1">
                      {errors.amount.message}
                    </div>
                  )}
                </div>
                <div className="col-sm-5">
                  <label className="form-label" htmlFor="uf">
                    Estado
                  </label>
                  <select
                    id="uf"
                    className={`form-select ${errors.uf ? "is-invalid" : ""}`}
                    defaultValue=""
                    {...register("uf")}
                  >
                    <option value="" disabled>
                      UF
                    </option>
                    {BRAZILIAN_STATES.map((state) => (
                      <option key={state.uf} value={state.uf}>
                        {state.uf}
                      </option>
                    ))}
                  </select>
                  {errors.uf && (
                    <div className="invalid-feedback">{errors.uf.message}</div>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">
                  Crie uma senha
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  {...register("password")}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="passwordConfirm">
                  Confirme a senha
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  className={`form-control ${errors.passwordConfirm ? "is-invalid" : ""}`}
                  {...register("passwordConfirm")}
                />
                {errors.passwordConfirm && (
                  <div className="invalid-feedback">
                    {errors.passwordConfirm.message}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              Voltar
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={goNext}
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Concluir e enviar solicitação"}
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <span className="text-secondary small">Já tem conta? </span>
          <Link href="/login" className="small fw-semibold">
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
