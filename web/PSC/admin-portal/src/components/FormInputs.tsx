import React, { useCallback, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Form Input Component
export const FormInput = React.memo(({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  className,
  ...props
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  className?: string;
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        onChange(parseFloat(e.target.value) || 0);
      } else {
        onChange(e.target.value);
      }
    },
    [onChange, type]
  );

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className="mt-2"
        {...props}
      />
    </div>
  );
});

FormInput.displayName = "FormInput";

// Paid Amount Input Component
export const PaidAmountInput = React.memo(({
  value,
  onChange,
  max,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (newValue === '') {
      onChange(0);
    } else {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(0, Math.min(numValue, max));
        onChange(clampedValue);
      }
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue("0");
      onChange(0);
    } else if (numValue > max) {
      setLocalValue(max.toString());
      onChange(max);
    } else {
      setLocalValue(numValue.toString());
      onChange(numValue);
    }
  };

  return (
    <Input
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="mt-2"
      placeholder="Enter paid amount"
      min="0"
      max={max}
      disabled={disabled}
    />
  );
});

PaidAmountInput.displayName = "PaidAmountInput";

// Special Requests Textarea
export const SpecialRequestsInput = React.memo(({
  value,
  onChange,
  placeholder = "Any special requirements or requests...",
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) => {
  return (
    <div className="md:col-span-3">
      <Label>Special Requests</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2"
        rows={rows}
      />
    </div>
  );
});

SpecialRequestsInput.displayName = "SpecialRequestsInput";