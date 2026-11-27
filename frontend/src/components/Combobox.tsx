import { useEffect, useId, useRef, useState } from "react";

type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
};

// A text box with a scrollable list. The user can pick an option or type any
// value, so the list never limits what can be saved.
export default function Combobox({
  value,
  onChange,
  options,
  placeholder,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const needle = value.trim().toLowerCase();
  const matches =
    showAll || !needle
      ? [...options]
      : options.filter((option) => option.toLowerCase().includes(needle));

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function openAll() {
    setShowAll(true);
    setActive(-1);
    setOpen(true);
  }

  function pick(option: string) {
    onChange(option);
    setOpen(false);
    setActive(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) openAll();
      else setActive((index) => Math.min(index + 1, matches.length - 1));
    } else if (event.key === "ArrowUp" && open) {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && active >= 0 && matches[active]) {
      event.preventDefault();
      pick(matches[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="combobox" ref={rootRef}>
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onClick={openAll}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          onChange(event.target.value);
          setShowAll(false);
          setActive(-1);
          setOpen(true);
        }}
      />
      <button
        type="button"
        className="combobox-toggle"
        tabIndex={-1}
        aria-label="Show options"
        onClick={() => (open ? setOpen(false) : openAll())}
      >
        ▾
      </button>
      {open && matches.length > 0 && (
        <ul className="combobox-list" id={listId} role="listbox">
          {matches.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={index === active}
              className={index === active ? "combobox-option active" : "combobox-option"}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
