"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { deleteUser, listUsers, UserResource } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/formatters";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UserForm from "@/components/UserForm";
import Spinner from "@/components/ui/Spinner";

export default function UserManager() {
  const toast = useToast();
  const [users, setUsers] = useState<UserResource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserResource | "new" | null>(null);
  const [deleting, setDeleting] = useState<UserResource | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(() => {
    listUsers()
      .then(setUsers)
      .catch((caught) =>
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Falha ao carregar usuários",
        ),
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    setRemoving(true);
    try {
      const name = deleting.name;
      await deleteUser(deleting.id);
      setDeleting(null);
      load();
      toast.success(`Usuário ${name} removido.`);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Falha ao remover usuário",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={() => setEditing("new")}
        >
          <UserPlus size={18} />
          Novo usuário
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!users && !error && <Spinner />}

      {users && (
        <div className="card cl-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 cl-table-cards">
              <thead>
                <tr className="text-secondary small text-uppercase">
                  <th className="ps-3">Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th className="text-end pe-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-3 fw-semibold" data-label="Nome">
                      {user.name}
                    </td>
                    <td className="text-secondary" data-label="E-mail">
                      {user.email}
                    </td>
                    <td data-label="Perfil">
                      <span className="badge text-bg-light">{user.role}</span>
                    </td>
                    <td data-label="Status">
                      <span
                        className={
                          user.active ? "cl-status-ok" : "text-secondary"
                        }
                      >
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-secondary" data-label="Criado em">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="text-end pe-3 cl-cell-actions">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => setEditing(user)}
                          aria-label={`Editar ${user.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleting(user)}
                          aria-label={`Remover ${user.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={editing !== null}
        title={editing === "new" ? "Novo usuário" : "Editar usuário"}
        onClose={() => setEditing(null)}
      >
        {editing !== null && (
          <UserForm
            user={editing === "new" ? undefined : editing}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Remover usuário"
        variant="danger"
        confirmLabel="Remover"
        loading={removing}
        message={
          deleting && (
            <>
              O usuário <strong>{deleting.name}</strong> ({deleting.email})
              perderá o acesso ao portal. Esta ação não pode ser desfeita.
            </>
          )
        }
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
