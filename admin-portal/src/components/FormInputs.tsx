import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateStatus } from "@/types/room-booking.type";

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


export const DatePickerInput = React.memo(({
  label,
  value,
  onChange,
  dateStatuses = [],
  placeholder = "Select date",
  disabled = false,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dateStatuses?: DateStatus[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) => {
  // Parse the date from backend format (2025-11-18 22:15:00.000) to Date object
  const parseBackendDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;

    // Handle both formats: "2025-11-18 22:15:00.000" and "2025-11-18T22:15:00.000Z"
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  const [date, setDate] = useState<Date | undefined>(
    value ? parseBackendDate(value) : undefined
  );

  // Update local date when value changes from parent (for edit mode)
  useEffect(() => {
    if (value) {
      const parsedDate = parseBackendDate(value);
      setDate(parsedDate);
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    console.log('Date selected:', selectedDate);
    setDate(selectedDate);
    if (selectedDate) {
      // Convert to datetime-local format (YYYY-MM-DDTHH:mm) for the form
      const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm");
      console.log('Formatted date for form:', formattedDate);
      onChange(formattedDate);
    } else {
      onChange(""); // Clear the value if no date selected
    }
  };

  // Create array of disabled dates
  const disabledDates = useMemo(() => {
    return dateStatuses
      .filter(ds =>
        ds.status === "BOOKED" ||
        ds.status === "OUT_OF_ORDER" ||
        ds.status === "RESERVED"
      )
      .map(ds => {
        // Ensure we have a proper Date object
        const date = new Date(ds.date);
        date.setHours(0, 0, 0, 0); // Normalize to start of day
        return date;
      });
  }, [dateStatuses]);

  const getDateStatus = (date: Date): DateStatus | undefined => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return dateStatuses.find(ds => {
      const statusDate = new Date(ds.date);
      statusDate.setHours(0, 0, 0, 0);
      return statusDate.getTime() === normalizedDate.getTime();
    });
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal mt-2",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) => {
              const normalizedDate = new Date(date);
              normalizedDate.setHours(0, 0, 0, 0);

              return disabledDates.some(disabledDate => {
                const normalizedDisabled = new Date(disabledDate);
                normalizedDisabled.setHours(0, 0, 0, 0);
                return normalizedDisabled.getTime() === normalizedDate.getTime();
              });
            }}
            initialFocus
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>

      {/* Debug info - remove in production */}
      <div className="mt-1 text-xs text-muted-foreground">
        Selected: {date ? format(date, "yyyy-MM-dd HH:mm") : "None"} |
        Form value: {value || "Empty"}
      </div>

      {/* Legend for date statuses */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Out of Order</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Reserved</span>
        </div>
      </div>
    </div>
  );
});

DatePickerInput.displayName = "DatePickerInput";

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

  // Sync with parent value
  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Update parent IMMEDIATELY for real-time calculation
    if (newValue === '') {
      onChange(0);
    } else {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        // Clamp the value between 0 and max
        const clampedValue = Math.max(0, Math.min(numValue, max));
        onChange(clampedValue);
      }
    }
  };

  const handleBlur = () => {
    // Final validation on blur
    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue("0");
      onChange(0);
    } else if (numValue > max) {
      setLocalValue(max.toString());
      onChange(max);
    } else {
      // Ensure the value is properly formatted
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