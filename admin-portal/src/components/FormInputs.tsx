import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  rooms = [], // Accept rooms data
  dateStatuses = [], // Accept pre-calculated date statuses
  placeholder = "Select date",
  disabled = false,
  className,
  isCheckout = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rooms?: any[]; // Your room data structure
  dateStatuses?: any[]; // Pre-calculated date statuses
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isCheckout?: boolean;
}) => {
  // Parse the date from backend format
  const parseBackendDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  // Local state for the currently selected date in the picker
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? parseBackendDate(value) : undefined
  );

  // Keep local state in sync with the external value (e.g. when editing)
  useEffect(() => {
    if (value) {
      const parsedDate = parseBackendDate(value);
      setSelectedDate(parsedDate);
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  const handleSelect = (nextDate: Date | undefined) => {
    setSelectedDate(nextDate);

    if (nextDate) {
      const formattedDate = format(nextDate, "yyyy-MM-dd'T'HH:mm");
      console.log(":::::::::",formattedDate)
      onChange(formattedDate);
    } else {
      onChange("");
    }
  };

  const calculatedDateStatuses = useMemo(() => {
    // Prefer rooms-based calculation when room data is provided
    if (rooms && rooms.length > 0) {
      const statusMap = new Map();

      rooms.forEach(room => {
        // console.log(`Processing room ${room.roomNumber}:`, {
        //   id: room.id,
        //   isOutOfOrder: room.isOutOfOrder,
        //   outOfOrderFrom: room.outOfOrderFrom,
        //   outOfOrderTo: room.outOfOrderTo,
        //   reservations: room.reservations,
        //   bookings: room.bookings
        // });

        // Check out-of-order dates
        if (room.isOutOfOrder && room.outOfOrderFrom && room.outOfOrderTo) {
          const from = new Date(room.outOfOrderFrom);
          const to = new Date(room.outOfOrderTo);
          const current = new Date(from);

          from.setHours(0, 0, 0, 0);
          to.setHours(0, 0, 0, 0);
          current.setHours(0, 0, 0, 0);

          while (current <= to) {
            const dateKey = current.toISOString().split('T')[0];
            statusMap.set(dateKey, {
              date: new Date(current),
              status: 'OUT_OF_ORDER',
              roomNumber: room.roomNumber
            });
            current.setDate(current.getDate() + 1);
          }
        }

        // Check reservations
        if (room.reservations) {
          room.reservations.forEach((reservation: any) => {
            const from = new Date(reservation.reservedFrom);
            const to = new Date(reservation.reservedTo);
            const current = new Date(from);

            from.setHours(0, 0, 0, 0);
            to.setHours(0, 0, 0, 0);
            current.setHours(0, 0, 0, 0);

            while (current < to) {
              const dateKey = current.toISOString().split('T')[0];
              const existingStatus = statusMap.get(dateKey);

              if (!existingStatus || existingStatus.status === 'BOOKED') {
                statusMap.set(dateKey, {
                  date: new Date(current),
                  status: 'RESERVED',
                  roomNumber: room.roomNumber
                });
              }
              current.setDate(current.getDate() + 1);
            }
          });
        }

        // Check bookings
        if (room.bookings) {
          room.bookings.forEach((booking: any) => {
            const from = new Date(booking.checkIn);
            const to = new Date(booking.checkOut);
            const current = new Date(from);

            from.setHours(0, 0, 0, 0);
            to.setHours(0, 0, 0, 0);
            current.setHours(0, 0, 0, 0);

            while (current < to) {
              const dateKey = current.toISOString().split('T')[0];
              const existingStatus = statusMap.get(dateKey);

              if (!existingStatus || existingStatus.status === 'RESERVED') {
                statusMap.set(dateKey, {
                  date: new Date(current),
                  status: 'BOOKED',
                  roomNumber: room.roomNumber
                });
              }
              current.setDate(current.getDate() + 1);
            }
          });
        }
      });

      const result = Array.from(statusMap.values());
      // console.log('Final calculated statuses (from rooms):', result);
      return result;
    }

    // Fallback: if explicit dateStatuses are provided, use them
    if (dateStatuses && dateStatuses.length > 0) {
      // console.log('Using provided dateStatuses:', dateStatuses);
      // Filter out AVAILABLE statuses since we don't need to mark available dates
      return dateStatuses.filter((ds) => ds.status !== "AVAILABLE");
    }

    // console.log('No rooms or dateStatuses provided');
    return [];
  }, [rooms, dateStatuses]);

  // Helper: should a given calendar day be disabled for selection?
  const isDateDisabled = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const status = calculatedDateStatuses.find((ds) => {
      const d = new Date(ds.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

    if (!status) return false;

    if (isCheckout) {
      // For checkout dates, only disable out-of-order dates
      return status.status === "OUT_OF_ORDER";
    }

    // For check-in dates, disable all unavailable dates
    return (
      status.status === "BOOKED" ||
      status.status === "OUT_OF_ORDER" ||
      status.status === "RESERVED"
    );
  }, [calculatedDateStatuses, isCheckout]);

  const bookedDates = useMemo(
    () =>
      calculatedDateStatuses
        .filter((ds) => ds.status === "BOOKED")
        .map((ds) => new Date(ds.date)),
    [calculatedDateStatuses]
  );

  const reservedDates = useMemo(
    () =>
      calculatedDateStatuses
        .filter((ds) => ds.status === "RESERVED")
        .map((ds) => new Date(ds.date)),
    [calculatedDateStatuses]
  );

  const outOfOrderDates = useMemo(
    () =>
      calculatedDateStatuses
        .filter((ds) => ds.status === "OUT_OF_ORDER")
        .map((ds) => new Date(ds.date)),
    [calculatedDateStatuses]
  );

  const disabledDates = useMemo(
    () =>
      isCheckout
        ? outOfOrderDates // checkout: only out of order blocked
        : [...bookedDates, ...reservedDates, ...outOfOrderDates],
    [bookedDates, reservedDates, outOfOrderDates, isCheckout]
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {/* {isCheckout && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
            Available dates
          </Badge>
        )} */}
      </div>
      <Popover>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal mt-2",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              {isCheckout ? (
                <span>Check-out day is available for booking (room becomes vacant)</span>
              ) : (
                <span>Select check-in date (cannot overlap with existing bookings)</span>
              )}
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={disabledDates}
            initialFocus
            className="rounded-md border p-3"
            modifiers={{
              booked: bookedDates,
              reserved: reservedDates,
              outOfOrder: outOfOrderDates,
            }}
            modifiersClassNames={{
              booked: "bg-blue-100 border-blue-300 text-blue-900",
              reserved: "bg-amber-100 border-amber-300 text-amber-900",
              outOfOrder: "bg-red-100 border-red-300 text-red-900",
            }}
          />

          {/* Legend */}
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-100 border-2 border-amber-300 rounded"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></div>
                <span>Out of Order</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Debug info */}
      <div className="mt-1 text-xs text-muted-foreground">
        Statuses: {calculatedDateStatuses.length}
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