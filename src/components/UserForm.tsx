"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createUser, updateUser, UserResource, UserRole } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";

interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

const buildSchema = (isEdit: boolean) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .min(2, "Informe o nome")
      .required("Informe o nome"),
    email: yup
      .string()
      .trim()
      .email("E-mail inválido")
      .required("Informe o e-mail"),
    role: yup
      .string()
      .oneOf(["ADMIN", "OPERATOR", "USER"], "Selecione o perfil")
      .required("Selecione o perfil"),
    password: yup
      .string()
      .transform((value) => value || "")
      .test(
        "password",
        isEdit ? "Mínimo de 6 caracteres" : "Informe a senha (mín. 6)",
        (value) => {
          if (!value) {
            return isEdit;
          }
          return value.length >= 6;
        },
      ),
  });

interface UserFormProps {
  user?: UserResource;
  onSaved: () => void;
}

export default function UserForm({ user, onSaved }: UserFormProps) {
  const isEdit = Boolean(user);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: yupResolver(buildSchema(isEdit)),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "USER",
      password: "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (user) {
        await updateUser(user.id, {
          name: values.name,
          email: values.email,
          role: values.role,
          password: values.password || undefined,
        });
        toast.success("Usuário atualizado com sucesso.");
      } else {
        await createUser({
          name: values.name,
          email: values.email,
          role: values.role,
          password: values.password ?? "",
        });
        toast.success("Usuário cadastrado com sucesso.");
      }
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o usuário.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label className="form-label" htmlFor="user-name">
          Nome
        </label>
        <input
          id="user-name"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          {...register("name")}
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="user-email">
          E-mail
        </label>
        <input
          id="user-email"
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          {...register("email")}
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email.message}</div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-sm-6">
          <label className="form-label" htmlFor="user-role">
            Perfil
          </label>
          <select id="user-role" className="form-select" {...register("role")}>
            <option value="USER">USER — cliente final</option>
            <option value="OPERATOR">OPERATOR — analisa solicitações</option>
            <option value="ADMIN">ADMIN — gerencia o sistema</option>
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="user-password">
            Senha
          </label>
          <input
            id="user-password"
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            placeholder={
              isEdit ? "Deixe em branco para manter" : "Mínimo de 6 caracteres"
            }
            {...register("password")}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password.message}</div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Salvando..."
            : isEdit
              ? "Salvar alterações"
              : "Cadastrar usuário"}
        </button>
      </div>
    </form>
  );
}
