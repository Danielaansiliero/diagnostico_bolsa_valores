interface DiagnosisProps {
  text: string;
}

export function Diagnosis({ text }: DiagnosisProps) {
  return (
    <section className="diagnosis">
      <h3>Diagnóstico</h3>
      <p>{text}</p>
    </section>
  );
}
