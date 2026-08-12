import { Checkbox } from './ui/checkbox';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  emptyMessage?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  emptyMessage = 'No hay opciones disponibles todavía.',
}: MultiSelectProps) {
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  if (options.length === 0) {
    return <p className="text-xs text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="max-h-48 overflow-y-auto rounded-md border border-line p-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-elevated"
        >
          <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
          {option.label}
        </label>
      ))}
    </div>
  );
}
