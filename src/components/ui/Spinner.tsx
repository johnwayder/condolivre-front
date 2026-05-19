interface SpinnerProps {
  label?: string;
  fullscreen?: boolean;
}

export default function Spinner({
  label = "Carregando...",
  fullscreen = false,
}: SpinnerProps) {
  return (
    <div
      className={`cl-spinner ${fullscreen ? "cl-spinner-full" : ""}`}
      role="status"
    >
      <div className="spinner-border text-primary" />
      {label && <span className="text-secondary small">{label}</span>}
      <span className="visually-hidden">Carregando</span>
    </div>
  );
}
