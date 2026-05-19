export interface LoanProduct {
  value: string;
  label: string;
  description: string;
}

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    value: "CONSIGNADO",
    label: "Empréstimo Consignado",
    description:
      "Crédito para funcionários de administradoras e condomínios, descontado em folha.",
  },
  {
    value: "CONDOMINIO",
    label: "Empréstimo de Condomínio",
    description:
      "Crédito para o condomínio realizar obras e melhorias durante a gestão do síndico.",
  },
  {
    value: "RECEBIVEIS",
    label: "Antecipação de Recebíveis",
    description:
      "Antecipação de valores a receber para manter o fluxo de caixa em dia.",
  },
];

export const productLabel = (value: string | null): string => {
  if (!value) {
    return "—";
  }
  return (
    LOAN_PRODUCTS.find((product) => product.value === value)?.label ?? value
  );
};
