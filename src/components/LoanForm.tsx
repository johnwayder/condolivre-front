"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { UserPlus, Users } from "lucide-react";
import Select from "react-select";
import {
  createClient,
  createLoan,
  listClients,
  LoanResource,
  updateLoan,
  UserResource,
} from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { BRAZILIAN_STATES, stateName } from "@/lib/brazilianStates";
import { LOAN_PRODUCTS } from "@/lib/loanProducts";
import { formatPercent } from "@/lib/formatters";
import ConfirmDialog from "./ui/ConfirmDialog";
import CurrencyField from "./ui/CurrencyField";
import Spinner from "./ui/Spinner";

interface LoanFormValues {
  amount: number;
  uf: string;
  productType: string;
}

interface PendingViolation {
  uf: string;
  projectedShareUf: number;
  limit: number;
}

type BorrowerMode = "existing" | "new";

interface ClientOption {
  value: string;
  label: string;
}

const schema = yup.object({
  amount: yup
    .number()
    .typeError("Informe um valor")
    .positive("O valor deve ser maior que zero")
    .required("Informe o valor"),
  uf: yup.string().required("Selecione o estado"),
  productType: yup.string().default(""),
});

interface LoanFormProps {
  loan?: LoanResource;
  onSaved: () => void;
}

const emptyNewClient = { name: "", email: "", password: "" };

export default function LoanForm({ loan, onSaved }: LoanFormProps) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const isEdit = Boolean(loan);
  const [pending, setPending] = useState<LoanFormValues | null>(null);
  const [violation, setViolation] = useState<PendingViolation | null>(null);
  const [forcing, setForcing] = useState(false);

  const [clients, setClients] = useState<UserResource[]>([]);
  const [clientsLoading, setClientsLoading] = useState(!isEdit);
  const [borrowerMode, setBorrowerMode] = useState<BorrowerMode>("existing");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newClient, setNewClient] = useState(emptyNewClient);
  const [borrowerError, setBorrowerError] = useState<string | null>(null);
  const [lockedRequesterId, setLockedRequesterId] = useState<string | null>(
    null,
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoanFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: loan ? loan.amountCents / 100 : undefined,
      uf: loan?.uf ?? "",
      productType: loan?.productType ?? "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      return;
    }
    listClients()
      .then((items) => {
        setClients(items);
        if (items.length === 0) {
          setBorrowerMode("new");
        }
      })
      .catch(() => setBorrowerMode("new"))
      .finally(() => setClientsLoading(false));
  }, [isEdit]);

  const clientOptions: ClientOption[] = clients.map((client) => ({
    value: client.id,
    label: `${client.name} — ${client.email}`,
  }));

  const resolveRequesterId = async (): Promise<string | null> => {
    if (lockedRequesterId) {
      return lockedRequesterId;
    }
    if (borrowerMode === "existing") {
      if (!selectedClientId) {
        setBorrowerError("Selecione o cliente do empréstimo.");
        return null;
      }
      setLockedRequesterId(selectedClientId);
      return selectedClientId;
    }
    const name = newClient.name.trim();
    const email = newClient.email.trim();
    if (name.length < 2) {
      setBorrowerError("Informe o nome do cliente.");
      return null;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setBorrowerError("Informe um e-mail válido para o cliente.");
      return null;
    }
    if (newClient.password.length < 6) {
      setBorrowerError("A senha do cliente deve ter ao menos 6 caracteres.");
      return null;
    }
    const created = await createClient({
      name,
      email,
      password: newClient.password,
    });
    setLockedRequesterId(created.id);
    return created.id;
  };

  const submit = async (values: LoanFormValues, force: boolean) => {
    setBorrowerError(null);
    try {
      if (loan) {
        await updateLoan(loan.id, {
          amount: values.amount,
          uf: values.uf,
          productType: values.productType || undefined,
          force,
        });
        toast.success("Empréstimo atualizado com sucesso.");
        onSaved();
        return;
      }

      const requesterId = await resolveRequesterId();
      if (!requesterId) {
        return;
      }
      await createLoan({
        amount: values.amount,
        uf: values.uf,
        productType: values.productType || undefined,
        force,
        requesterId,
      });
      toast.success("Empréstimo registrado com sucesso.");
      onSaved();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 422 &&
        error.errors?.code === "CONCENTRATION_LIMIT_EXCEEDED" &&
        isAdmin &&
        !force
      ) {
        setPending(values);
        setViolation({
          uf: String(error.errors.uf),
          projectedShareUf: Number(error.errors.projectedShareUf),
          limit: Number(error.errors.limit),
        });
        return;
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o empréstimo. Tente novamente.",
      );
    }
  };

  const onConfirmForce = async () => {
    if (!pending) {
      return;
    }
    setForcing(true);
    await submit(pending, true);
    setForcing(false);
    setPending(null);
    setViolation(null);
  };

  const switchBorrowerMode = (mode: BorrowerMode) => {
    setBorrowerMode(mode);
    setBorrowerError(null);
    setLockedRequesterId(null);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit((values) => submit(values, false))}
        noValidate
      >
        {!isEdit && (
          <div className="mb-3">
            <div
              className="btn-group btn-group-sm mb-3"
              role="group"
              aria-label="Tipo de cliente"
            >
              <button
                type="button"
                className={`btn ${borrowerMode === "existing" ? "btn-primary" : "btn-light"} d-flex align-items-center gap-1`}
                onClick={() => switchBorrowerMode("existing")}
                disabled={clients.length === 0}
              >
                <Users size={15} />
                Cliente existente
              </button>
              <button
                type="button"
                className={`btn ${borrowerMode === "new" ? "btn-primary" : "btn-light"} d-flex align-items-center gap-1`}
                onClick={() => switchBorrowerMode("new")}
              >
                <UserPlus size={15} />
                Novo cliente
              </button>
            </div>

            {clientsLoading ? (
              <Spinner />
            ) : borrowerMode === "existing" ? (
              <div>
                <label className="form-label" htmlFor="requester">
                  Selecione o cliente
                </label>
                <Select<ClientOption>
                  instanceId="loan-client-select"
                  inputId="requester"
                  options={clientOptions}
                  value={
                    clientOptions.find(
                      (option) => option.value === selectedClientId,
                    ) ?? null
                  }
                  onChange={(option) => {
                    setSelectedClientId(option?.value ?? "");
                    setBorrowerError(null);
                    setLockedRequesterId(null);
                  }}
                  placeholder="Busque por nome ou e-mail..."
                  noOptionsMessage={() => "Nenhum cliente encontrado"}
                  isClearable
                  classNamePrefix="cl-select"
                />
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="client-name">
                    Nome do cliente
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    className="form-control"
                    value={newClient.name}
                    onChange={(event) => {
                      setNewClient((current) => ({
                        ...current,
                        name: event.target.value,
                      }));
                      setBorrowerError(null);
                      setLockedRequesterId(null);
                    }}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="client-email">
                    E-mail
                  </label>
                  <input
                    id="client-email"
                    type="email"
                    className="form-control"
                    value={newClient.email}
                    onChange={(event) => {
                      setNewClient((current) => ({
                        ...current,
                        email: event.target.value,
                      }));
                      setBorrowerError(null);
                      setLockedRequesterId(null);
                    }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="client-password">
                    Senha de acesso
                  </label>
                  <input
                    id="client-password"
                    type="password"
                    className="form-control"
                    value={newClient.password}
                    onChange={(event) => {
                      setNewClient((current) => ({
                        ...current,
                        password: event.target.value,
                      }));
                      setBorrowerError(null);
                      setLockedRequesterId(null);
                    }}
                  />
                  <div className="form-text">
                    O cliente usa este e-mail e senha para acompanhar os
                    próprios empréstimos.
                  </div>
                </div>
              </div>
            )}

            {borrowerError && (
              <div className="text-danger small mt-2">{borrowerError}</div>
            )}
          </div>
        )}

        <div className="row g-3">
          <div className="col-12">
            <label className="form-label" htmlFor="amount">
              Valor do empréstimo
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

          <div className="col-sm-6">
            <label className="form-label" htmlFor="uf">
              Estado (UF)
            </label>
            <select
              id="uf"
              className={`form-select ${errors.uf ? "is-invalid" : ""}`}
              defaultValue={loan?.uf ?? ""}
              {...register("uf")}
            >
              <option value="" disabled>
                Selecione
              </option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={state.uf} value={state.uf}>
                  {state.uf} — {state.name}
                </option>
              ))}
            </select>
            {errors.uf && (
              <div className="invalid-feedback">{errors.uf.message}</div>
            )}
          </div>

          <div className="col-sm-6">
            <label className="form-label" htmlFor="productType">
              Produto de crédito (opcional)
            </label>
            <select
              id="productType"
              className="form-select"
              defaultValue={loan?.productType ?? ""}
              {...register("productType")}
            >
              <option value="">Não informar</option>
              {LOAN_PRODUCTS.map((product) => (
                <option key={product.value} value={product.value}>
                  {product.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="small text-secondary mt-3 mb-0">
          O empréstimo só é salvo se a carteira continuar dentro dos limites de
          concentração por estado.
        </p>

        <div className="d-flex justify-content-end mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Validando concentração..."
              : isEdit
                ? "Salvar alterações"
                : "Registrar empréstimo"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(violation)}
        title="Limite de concentração ultrapassado"
        variant="danger"
        confirmLabel="Forçar registro"
        cancelLabel="Cancelar"
        loading={forcing}
        onCancel={() => {
          setPending(null);
          setViolation(null);
        }}
        onConfirm={onConfirmForce}
        message={
          violation && (
            <>
              Este empréstimo levaria{" "}
              <strong>
                {stateName(violation.uf)} ({violation.uf})
              </strong>{" "}
              a <strong>{formatPercent(violation.projectedShareUf)}</strong> da
              carteira, acima do limite de{" "}
              <strong>{formatPercent(violation.limit)}</strong>.
              <br />
              Como administrador, você pode forçar a operação — o empréstimo
              ficará marcado como <strong>forçado</strong> e o estado entrará em
              violação no painel. Deseja continuar?
            </>
          )
        }
      />
    </>
  );
}
