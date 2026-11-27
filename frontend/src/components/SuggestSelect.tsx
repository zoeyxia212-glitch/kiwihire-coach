import { useState } from "react";

const OTHER = "__other__";

type SuggestSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
};

// A dropdown list of options. The last choice lets the user type a value
// that is not in the list, so nothing limits what can be saved.
export default function SuggestSelect({
  value,
  onChange,
  options,
  placeholder,
}: SuggestSelectProps) {
  const valueIsCustom = value !== "" && !options.includes(value);
  const [customMode, setCustomMode] = useState(valueIsCustom);
  const showInput = customMode || valueIsCustom;

  return (
    <>
      <select
        value={showInput ? OTHER : value}
        onChange={(event) => {
          const next = event.target.value;
          if (next === OTHER) {
            setCustomMode(true);
            if (options.includes(value)) onChange("");
          } else {
            setCustomMode(false);
            onChange(next);
          }
        }}
      >
        <option value="">Choose...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={OTHER}>Other (type your own)</option>
      </select>
      {showInput && (
        <input
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </>
  );
}
