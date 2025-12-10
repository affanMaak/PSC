import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";

interface DateStatus {
    date: Date;
    status: "BOOKED" | "RESERVED" | "OUT_OF_ORDER" | "AVAILABLE";
    roomNumber?: string;
}

interface UnifiedDatePickerProps {
    value?: Date | string | null;
    onChange: (date: Date | undefined) => void;
    mode?: "date" | "datetime";
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    // For Room Booking Availability
    rooms?: any[];
    dateStatuses?: any[];
    isCheckout?: boolean;
    // For Time Picker
    timeSlots?: string[];
    className?: string;
}

const DEFAULT_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "01:00", "01:30", "02:00", "02:30",
    "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
    "06:00"
];

export function UnifiedDatePicker({
    value,
    onChange,
    mode = "date",
    label,
    placeholder = "Select date",
    disabled = false,
    minDate,
    rooms = [],
    dateStatuses = [],
    isCheckout = false,
    timeSlots = DEFAULT_TIME_SLOTS,
    className,
}: UnifiedDatePickerProps) {
    const [open, setOpen] = useState(false);

    // Parse value to Date object
    const parsedDate = useMemo(() => {
        if (!value) return undefined;
        if (value instanceof Date) return value;
        try {
            // Handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
            // We want to preserve the local time components
            const d = new Date(value);
            return isNaN(d.getTime()) ? undefined : d;
        } catch {
            return undefined;
        }
    }, [value]);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(parsedDate);
    // console.log(parsedDate)
    const [selectedTime, setSelectedTime] = useState<string>(
        parsedDate ? format(parsedDate, "HH:mm") : ""
    );

    useEffect(() => {
        setSelectedDate(parsedDate);
        if (parsedDate && mode === "datetime") {
            setSelectedTime(format(parsedDate, "HH:mm"));
        }
    }, [parsedDate, mode]);

    // Availability Logic (Ported from DatePickerInput)
    const calculatedDateStatuses = useMemo(() => {
        if (rooms && rooms.length > 0) {
            const statusMap = new Map();

            rooms.forEach(room => {
                // Check out-of-order dates
                if (room.isOutOfOrder && room.outOfOrderFrom && room.outOfOrderTo) {
                    const from = new Date(room.outOfOrderFrom);
                    const to = new Date(room.outOfOrderTo);
                    const current = new Date(from);
                    from.setHours(0, 0, 0, 0);
                    to.setHours(0, 0, 0, 0);
                    current.setHours(0, 0, 0, 0);

                    while (current <= to) {
                        const dateKey = format(current, "yyyy-MM-dd");
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
                            const dateKey = format(current, "yyyy-MM-dd");
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
                            const dateKey = format(current, "yyyy-MM-dd");
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

            return Array.from(statusMap.values());
        }

        if (dateStatuses && dateStatuses.length > 0) {
            return dateStatuses.filter((ds: any) => ds.status !== "AVAILABLE");
        }

        return [];
    }, [rooms, dateStatuses]);

    const isDateDisabled = useCallback((date: Date) => {
        // Check minDate
        if (minDate) {
            const today = new Date(minDate);
            today.setHours(0, 0, 0, 0);
            if (date < today) return true;
        } else {
            // Default to today if no minDate provided (optional, but safe default for bookings)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) return true;
        }

        // Check availability
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const status = calculatedDateStatuses.find((ds: any) => {
            const d = new Date(ds.date);
            return (
                d.getFullYear() === year &&
                d.getMonth() === month &&
                d.getDate() === day
            );
        });

        if (!status) return false;

        if (isCheckout) {
            return status.status === "OUT_OF_ORDER";
        }

        return (
            status.status === "BOOKED" ||
            status.status === "OUT_OF_ORDER" ||
            status.status === "RESERVED"
        );
    }, [calculatedDateStatuses, isCheckout, minDate]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (mode === "date") {
            onChange(date);
            setOpen(false);
        } else {
            // For datetime, we wait for time selection or just update date part
            if (date && selectedTime) {
                const [hours, minutes] = selectedTime.split(":").map(Number);
                const newDateTime = new Date(date);
                newDateTime.setHours(hours, minutes, 0, 0);
                onChange(newDateTime);
            } else {
                // If no time selected yet, just update internal state
            }
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        if (selectedDate) {
            const [hours, minutes] = time.split(":").map(Number);
            const newDateTime = new Date(selectedDate);
            newDateTime.setHours(hours, minutes, 0, 0);
            onChange(newDateTime);
            setOpen(false); // Close on time select? Maybe keep open? 
            // User might want to change date. Let's keep it open or close it?
            // PhotoshootBookings had it inline. Here it's a popover.
            // If it's a popover, usually selecting the final piece closes it.
            setOpen(false);
        }
    };

    // Modifiers for Calendar
    const bookedDates = useMemo(() => calculatedDateStatuses.filter((ds: any) => ds.status === "BOOKED").map((ds: any) => new Date(ds.date)), [calculatedDateStatuses]);
    const reservedDates = useMemo(() => calculatedDateStatuses.filter((ds: any) => ds.status === "RESERVED").map((ds: any) => new Date(ds.date)), [calculatedDateStatuses]);
    const outOfOrderDates = useMemo(() => calculatedDateStatuses.filter((ds: any) => ds.status === "OUT_OF_ORDER").map((ds: any) => new Date(ds.date)), [calculatedDateStatuses]);

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                            mode === "datetime" && selectedTime ? (
                                <span>{format(selectedDate, "PPP")} at {selectedTime}</span>
                            ) : (
                                format(selectedDate, "PPP")
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                        <div className={cn("p-3", mode === "datetime" && "border-r")}>
                            {/* Legend/Info for Room Booking */}
                            {(rooms.length > 0 || dateStatuses.length > 0) && (
                                <div className="mb-3 pb-3 border-b">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Info className="h-3 w-3" />
                                        {isCheckout ? (
                                            <span>Check-out day is available</span>
                                        ) : (
                                            <span>Select check-in date</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-100 border border-blue-300 rounded"></div>Booked</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-100 border border-amber-300 rounded"></div>Reserved</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-100 border border-red-300 rounded"></div>Out of Order</div>
                                    </div>
                                </div>
                            )}

                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={isDateDisabled}
                                initialFocus
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
                        </div>

                        {mode === "datetime" && (
                            <div className="p-3 w-full sm:w-64 max-h-[350px] overflow-y-auto">
                                <Label className="text-sm font-medium mb-2 block">Select Time</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "default" : "outline"}
                                            size="sm"
                                            className={cn(
                                                "text-xs",
                                                selectedTime === time && "bg-primary text-primary-foreground"
                                            )}
                                            onClick={() => handleTimeSelect(time)}
                                            disabled={!selectedDate}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                                {!selectedDate && (
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                        Please select a date first
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
