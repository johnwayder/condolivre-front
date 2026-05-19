"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import {
  ConcentrationRule,
  createRule,
  deleteRule,
  listRules,
  updateRule,
} from "@/lib/api";
import { ApiError } from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";
import { BRAZILIAN_STATES } from "@/lib/brazilianStates";
import { formatPercent } from "@/lib/formatters";
import Spinner from "@/components/ui/Spinner";

interface RuleManagerProps {
  onChange?: () => void;
}

export default function RuleManager({ onChange }: RuleManagerProps) {
  const toast = useToast();
  const [rules, setRules] = useState<ConcentrationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLimit, setDraftLimit] = useState("");
  const [draftActive, setDraftActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newUf, setNewUf] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const refresh = useCallback(async () => {
    try {
      setRules(await listRules());
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Falha ao carregar regras",
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startEdit = (rule: ConcentrationRule) => {
    setEditingId(rule.id);
    setDraftLimit((rule.limitFraction * 100).toString());
    setDraftActive(rule.active);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (rule: ConcentrationRule) => {
    const fraction = Number(draftLimit) / 100;
    if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 1) {
      toast.error("Informe um limite entre 0 e 100%.");
      return;
    }
    setSaving(true);
    try {
      await updateRule(rule.id, {
        limitFraction: fraction,
        active: draftActive,
      });
      setEditingId(null);
      await refresh();
      onChange?.();
      toast.success("Limite atualizado com sucesso.");
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "Falha ao salvar a regra",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (rule: ConcentrationRule) => {
    try {
      await deleteRule(rule.id);
      await refresh();
      onChange?.();
      toast.success(`Regra de ${rule.uf} removida.`);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Falha ao remover a regra",
      );
    }
  };

  const onCreate = async () => {
    const fraction = Number(newLimit) / 100;
    if (!newUf || !Number.isFinite(fraction) || fraction <= 0 || fraction > 1) {
      toast.error("Selecione um estado e um limite entre 0 e 100%.");
      return;
    }
    try {
      await createRule({ scope: "UF", uf: newUf, limitFraction: fraction });
      setNewUf("");
      setNewLimit("");
      await refresh();
      onChange?.();
      toast.success(`Limite de ${newUf} adicionado.`);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError ? caught.message : "Falha ao criar a regra",
      );
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <p className="small text-secondary mb-0">
        Os limites são apenas exibidos. Clique em <strong>Editar</strong> para
        alterar uma regra e confirme em <strong>Salvar</strong>.
      </p>

      <div className="card cl-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 cl-table-cards">
            <thead>
              <tr className="text-secondary small text-uppercase">
                <th className="ps-3">Escopo</th>
                <th>Estado</th>
                <th style={{ width: 170 }}>Limite</th>
                <th>Status</th>
                <th className="text-end pe-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const isEditing = editingId === rule.id;
                return (
                  <tr key={rule.id}>
                    <td className="ps-3" data-label="Escopo">
                      <span className="badge text-bg-light">{rule.scope}</span>
                    </td>
                    <td data-label="Estado">{rule.uf ?? "Todos os estados"}</td>

                    <td data-label="Limite">
                      {isEditing ? (
                        <div
                          className="input-group input-group-sm"
                          style={{ maxWidth: 130 }}
                        >
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            className="form-control"
                            value={draftLimit}
                            onChange={(event) =>
                              setDraftLimit(event.target.value)
                            }
                            autoFocus
                          />
                          <span className="input-group-text">%</span>
                        </div>
                      ) : (
                        <span className="fw-semibold">
                          {formatPercent(rule.limitFraction)}
                        </span>
                      )}
                    </td>

                    <td data-label="Status">
                      {isEditing ? (
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={draftActive}
                            onChange={(event) =>
                              setDraftActive(event.target.checked)
                            }
                          />
                          <span className="small">
                            {draftActive ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`badge ${rule.active ? "text-bg-success" : "text-bg-secondary"}`}
                        >
                          {rule.active ? "Ativa" : "Inativa"}
                        </span>
                      )}
                    </td>

                    <td className="text-end pe-3 cl-cell-actions">
                      <div className="d-flex gap-1 justify-content-end">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                              onClick={() => saveEdit(rule)}
                              disabled={saving}
                            >
                              <Check size={15} />
                              {saving ? "Salvando..." : "Salvar"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              onClick={cancelEdit}
                              disabled={saving}
                              aria-label="Cancelar edição"
                            >
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-light d-flex align-items-center gap-1"
                              onClick={() => startEdit(rule)}
                              disabled={editingId !== null}
                            >
                              <Pencil size={15} />
                              Editar
                            </button>
                            {rule.scope === "UF" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onDelete(rule)}
                                disabled={editingId !== null}
                                aria-label={`Remover regra de ${rule.uf}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="h6 fw-bold">Adicionar limite específico por estado</h3>
        <p className="small text-secondary">
          Estados sem regra própria seguem o limite padrão (escopo DEFAULT).
        </p>
        <div className="row g-2 align-items-end">
          <div className="col-sm-5">
            <label className="form-label small" htmlFor="new-uf">
              Estado
            </label>
            <select
              id="new-uf"
              className="form-select"
              value={newUf}
              onChange={(event) => setNewUf(event.target.value)}
            >
              <option value="">Selecione</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={state.uf} value={state.uf}>
                  {state.uf} — {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-sm-4">
            <label className="form-label small" htmlFor="new-limit">
              Limite (%)
            </label>
            <input
              id="new-limit"
              type="number"
              step="0.5"
              min="0"
              max="100"
              className="form-control"
              value={newLimit}
              onChange={(event) => setNewLimit(event.target.value)}
            />
          </div>
          <div className="col-sm-3">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={onCreate}
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
