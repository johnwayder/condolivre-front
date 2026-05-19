"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createRequest } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";
import { BRAZILIAN_STATES } from "@/lib/brazilianStates";
import { LOAN_PRODUCTS } from "@/lib/loanProducts";
import CurrencyField from "./ui/CurrencyField";

interface RequestFormValues {
  amount: number;
  uf: string;
  productType: string;
}

const schema = yup.object({
  amount: yup
    .number()
    .typeError("Informe o valor")
    .positive("O valor deve ser maior que zero")
    .required("Informe o valor"),
  uf: yup.string().required("Selecione o estado"),
  productType: yup.string().required("Escolha o serviço"),
});

export default function RequestForm({ onSaved }: { onSaved: () => void }) {
  const toast = useToast();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (values: RequestFormValues) => {
    try {
      await createRequest({
        amount: values.amount,
        uf: values.uf,
        productType: values.productType,
      });
      toast.success(
        "Solicitação enviada com sucesso. Acompanhe o andamento por aqui.",
      );
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível enviar a solicitação.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label className="form-label" htmlFor="req-product">
          Serviço
        </label>
        <select
          id="req-product"
          className={`form-select ${errors.productType ? "is-invalid" : ""}`}
          defaultValue=""
          {...register("productType")}
        >
          <option value="" disabled>
            Selecione o serviço
          </option>
          {LOAN_PRODUCTS.map((product) => (
            <option key={product.value} value={product.value}>
              {product.label}
            </option>
          ))}
        </select>
        {errors.productType && (
          <div className="invalid-feedback">{errors.productType.message}</div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-sm-7">
          <label className="form-label" htmlFor="req-amount">
            Valor desejado
          </label>
          <CurrencyField
            name="amount"
            control={control}
            id="req-amount"
            invalid={Boolean(errors.amount)}
          />
          {errors.amount && (
            <div className="text-danger small mt-1">
              {errors.amount.message}
            </div>
          )}
        </div>
        <div className="col-sm-5">
          <label className="form-label" htmlFor="req-uf">
            Estado
          </label>
          <select
            id="req-uf"
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

      <p className="small text-secondary mt-3 mb-0">
        Sua solicitação entrará <strong>em análise</strong> pela equipe
        CondoLivre. Você acompanha o resultado por aqui.
      </p>

      <div className="d-flex justify-content-end mt-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar solicitação"}
        </button>
      </div>
    </form>
  );
}
