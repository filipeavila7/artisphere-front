import { FaCheck } from "react-icons/fa";

export type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error?: string;
  showValid?: boolean;
  checking?: boolean;
  successMessage?: string;
  autoComplete?: string;
  placeholder?: string;
  index: number;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
};

function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  showValid,
  checking,
  successMessage,
  autoComplete,
  placeholder,
  index,
  trailing,
  children,
}: FormFieldProps) {
  const state = error ? " invalid" : showValid ? " valid" : "";

  return (
    <div
      className={`field${state}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <label htmlFor={id}>{label}</label>

      <div className="input-wrapper">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
        />

        {trailing ??
          (checking ? (
            <span className="field-spinner" aria-hidden="true" />
          ) : (
            showValid && <FaCheck className="valid-icon" />
          ))}
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : checking ? (
        <p className="field-hint" aria-live="polite">
          Checking availability...
        </p>
      ) : (
        successMessage && (
          <p className="field-hint success" aria-live="polite">
            {successMessage}
          </p>
        )
      )}

      {children}
    </div>
  );
}

export default FormField;