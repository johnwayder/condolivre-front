"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Modal from "@/components/ui/Modal";
import LoanForm from "@/components/LoanForm";
import RequestForm from "@/components/RequestForm";
import RuleManager from "@/components/RuleManager";
import ProfileForm from "@/components/ProfileForm";

interface ModalsContextValue {
  openNewLoan: () => void;
  openNewRequest: () => void;
  openRules: () => void;
  openProfile: () => void;
  dataVersion: number;
}

const ModalsContext = createContext<ModalsContextValue | undefined>(undefined);

export const ModalsProvider = ({ children }: { children: ReactNode }) => {
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const bump = useCallback(() => setDataVersion((version) => version + 1), []);

  const value = useMemo<ModalsContextValue>(
    () => ({
      openNewLoan: () => setNewLoanOpen(true),
      openNewRequest: () => setNewRequestOpen(true),
      openRules: () => setRulesOpen(true),
      openProfile: () => setProfileOpen(true),
      dataVersion,
    }),
    [dataVersion],
  );

  return (
    <ModalsContext.Provider value={value}>
      {children}

      <Modal
        open={newLoanOpen}
        title="Novo empréstimo"
        onClose={() => setNewLoanOpen(false)}
      >
        <LoanForm
          onSaved={() => {
            setNewLoanOpen(false);
            bump();
          }}
        />
      </Modal>

      <Modal
        open={newRequestOpen}
        title="Nova solicitação"
        onClose={() => setNewRequestOpen(false)}
      >
        <RequestForm
          onSaved={() => {
            setNewRequestOpen(false);
            bump();
          }}
        />
      </Modal>

      <Modal
        open={rulesOpen}
        title="Limites de concentração"
        size="lg"
        onClose={() => {
          setRulesOpen(false);
          bump();
        }}
      >
        <RuleManager onChange={bump} />
      </Modal>

      <Modal
        open={profileOpen}
        title="Meus dados"
        onClose={() => setProfileOpen(false)}
      >
        <ProfileForm onSaved={() => setProfileOpen(false)} />
      </Modal>
    </ModalsContext.Provider>
  );
};

export const useModals = (): ModalsContextValue => {
  const context = useContext(ModalsContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalsProvider");
  }
  return context;
};
