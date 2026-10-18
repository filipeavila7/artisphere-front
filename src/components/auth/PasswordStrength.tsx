import {
  getPasswordStrength,
  strengthLabels,
} from "../../utils/authValidation";

type PasswordStrengthProps = {
  password: string;
};

function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);

  return (
    <div className={`strength level-${strength}`}>
      <div className="strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`strength-bar${level <= strength ? " on" : ""}`}
          />
        ))}
      </div>

      <span className="strength-label">{strengthLabels[strength]}</span>
    </div>
  );
}

export default PasswordStrength;