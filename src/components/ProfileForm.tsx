"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { updateProfile } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";

interface ProfileFormValues {
  name: string;
  email: string;
  password: string;
}

const schema = yup.object({
  name: yup.string().trim().min(2, "Informe o nome").required("Informe o nome"),
  email: yup
    .string()
    .trim()
    .email("E-mail inválido")
    .required("Informe o e-mail"),
  password: yup
    .string()
    .transform((value) => value || "")
    .default(""),
});

export default function ProfileForm({ onSaved }: { onSaved: () => void }) {
  const { user, applyUser } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const updated = await updateProfile({
        name: values.name,
        email: values.email,
        password: values.password || undefined,
      });
      applyUser(updated);
      toast.success("Seus dados foram atualizados com sucesso.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar os dados.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label className="form-label" htmlFor="profile-name">
          Nome
        </label>
        <input
          id="profile-name"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          {...register("name")}
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="profile-email">
          E-mail
        </label>
        <input
          id="profile-email"
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          {...register("email")}
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email.message}</div>
        )}
      </div>

      <div className="mb-2">
        <label className="form-label" htmlFor="profile-password">
          Nova senha
        </label>
        <input
          id="profile-password"
          type="password"
          className="form-control"
          placeholder="Deixe em branco para manter a atual"
          {...register("password")}
        />
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar dados"}
        </button>
      </div>
    </form>
  );
}
