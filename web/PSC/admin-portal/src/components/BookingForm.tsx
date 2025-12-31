import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomType, Room, BookingForm, DateStatus } from "@/types/room-booking.type";
import { FormInput, SpecialRequestsInput } from "./FormInputs";
import { PaymentSection } from "./PaymentSection";
import { MemberSearchComponent } from "./MemberSearch";
import { Member } from "@/types/room-booking.type";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Info } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { getPakistanDateString, parsePakistanDate } from "@/utils/pakDate";
import { Button } from "./ui/button";

interface BookingFormProps {
  form: BookingForm;
  onChange: (field: keyof BookingForm, value: any) => void;
  roomTypes: RoomType[];
  availableRooms: Room[];
  isLoadingRoomTypes: boolean;
  // Member search props
  memberSearch: string;
  onMemberSearchChange: (value: string) => void;
  showMemberResults: boolean;
  searchResults: Member[];
  isSearching: boolean;
  selectedMember: Member | null;
  onSelectMember: (member: Member) => void;
  onClearMember: () => void;
  onSearchFocus: () => void;
  // Date status
  dateStatuses: DateStatus[];
  isEdit?: boolean;
}

export const BookingFormComponent = React.memo(({
  form,
  onChange,
  roomTypes,
  availableRooms,
  isLoadingRoomTypes,
  // Member search
  memberSearch,
  onMemberSearchChange,
  showMemberResults,
  searchResults,
  isSearching,
  selectedMember,
  onSelectMember,
  onClearMember,
  onSearchFocus,
  // Date status
  dateStatuses,
  isEdit = false,
}: BookingFormProps) => {
  return (
    <div className="space-y-8">

      {/* MEMBER SEARCH CARD */}
      {!isEdit && <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Member Information</h3>

        <MemberSearchComponent
          searchTerm={memberSearch}
          onSearchChange={onMemberSearchChange}
          showResults={showMemberResults}
          searchResults={searchResults}
          isSearching={isSearching}
          selectedMember={selectedMember}
          onSelectMember={onSelectMember}
          onClearMember={onClearMember}
          onFocus={onSearchFocus}
        />
      </div>}

      {/* ROOM SELECTION CARD */}
      <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Room Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Room Type */}
          <div>
            <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
              Room Type *
            </Label>

            {isLoadingRoomTypes ? (
              <div className="h-10 bg-muted animate-pulse rounded-md mt-2" />
            ) : (
              <Select
                value={form.roomTypeId}
                onValueChange={(val) => {
                  onChange("roomTypeId", val);
                  onChange("roomId", "");
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>

                <SelectContent>
                  {roomTypes?.map((type: RoomType) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.type} — PKR {parseInt(type.priceMember).toLocaleString()} (Member) / PKR{" "}
                      {parseInt(type.priceGuest).toLocaleString()} (Guest)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Room Number */}
          <div>
            <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
              Room Number *
            </Label>

            <Select
              value={form.roomId}
              onValueChange={(val) => onChange("roomId", val)}
              disabled={!form.roomTypeId || availableRooms.length === 0}
            >
              <SelectTrigger className="mt-1">
                <SelectValue
                  placeholder={
                    !form.roomTypeId
                      ? "Select type first"
                      : availableRooms.length === 0
                        ? "No rooms available"
                        : "Select room"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {availableRooms.map((room: Room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Type */}
          <div>
            <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
              Pricing Type
            </Label>

            <Select
              value={form.pricingType}
              onValueChange={(val) => onChange("pricingType", val)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select pricing" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>


      {/* Guest INFORMATION */}
      {form.pricingType == "guest" && <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Guest Information</h3>

        <div className="flex  flex-col">

          <div className="flex items-center justify-center gap-x-5">

            <div className="w-1/2">
              <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                Guest Name *
              </Label>
              {/* {console.log(form)} */}

              <FormInput
                label=""
                type="text"
                value={form.guestName}
                onChange={(val) => onChange("guestName", val)}
              />
            </div>

            <div className="w-1/2">
              <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                Contact
              </Label>

              <FormInput
                label=""
                type="number"
                value={form.guestContact}
                onChange={(val) => onChange("guestContact", val)}
                min="0"
              />
            </div>

          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <Label className="text-sm font-medium my-2 block whitespace-nowrap">
              Who will Pay?
            </Label>
            <Select
              value={form.paidBy}
              onValueChange={(val) => onChange("paidBy", val)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Who will pay?" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="GUEST">Guest</SelectItem>
              </SelectContent>
            </Select>


          </div>

        </div>
      </div>}

      {/* General INFORMATION */}
      <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">General Information</h3>

        <div className="flex  flex-col">

          <div className="flex items-center justify-center gap-x-5">
            {/* Adults */}
            <div className="w-1/2">
              <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                Number of Adults *
              </Label>

              <FormInput
                label=""
                type="number"
                value={form.numberOfAdults}
                onChange={(val) => onChange("numberOfAdults", val)}
                min="1"
                max="4"
              />
            </div>

            {/* Children */}
            <div className="w-1/2">
              <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                Number of Children
              </Label>

              <FormInput
                label=""
                type="number"
                value={form.numberOfChildren}
                onChange={(val) => onChange("numberOfChildren", val)}
                min="0"
                max="4"
              />
            </div>

          </div>
          {/* Special Requests */}
          <div className="sm:col-span-2 lg:col-span-1">
            <SpecialRequestsInput
              value={form.specialRequests || ""}
              onChange={(val) => onChange("specialRequests", val)}
            />
          </div>

          {/* Remarks (Edit Mode Only) */}
          {isEdit && (
            <div className="sm:col-span-2 lg:col-span-1 mt-4">
              <Label className="text-sm font-medium mb-1 block">
                Remarks (Optional)
              </Label>
              <textarea
                className="w-full p-2 mt-1 border rounded-md resize-none min-h-[60px] text-sm"
                placeholder="Add notes about this booking update (e.g., reason for changes, refund details, etc.)"
                value={form.remarks || ""}
                onChange={(e) => onChange("remarks", e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                These remarks will be stored with the booking record
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DATES */}
      <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Stay Dates</h3>

        <div className="space-y-2">
          <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
            Stay Period *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-12 bg-muted/30 border-none shadow-none",
                  !form.checkIn && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {form.checkIn ? (
                  form.checkOut && form.checkOut !== form.checkIn ? (
                    <>
                      {format(new Date(form.checkIn), "LLL dd, y")} -{" "}
                      {format(new Date(form.checkOut), "LLL dd, y")}
                    </>
                  ) : (
                    format(new Date(form.checkIn), "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={form.checkIn ? new Date(form.checkIn) : new Date()}
                selected={{
                  from: form.checkIn ? new Date(form.checkIn) : undefined,
                  to: form.checkOut ? new Date(form.checkOut) : undefined,
                }}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from) {
                    onChange("checkIn", format(range.from, "yyyy-MM-dd'T'HH:mm"));
                    onChange("checkOut", range.to ? format(range.to, "yyyy-MM-dd'T'HH:mm") : format(range.from, "yyyy-MM-dd'T'HH:mm"));
                  } else {
                    onChange("checkIn", "");
                    onChange("checkOut", "");
                  }
                }}
                numberOfMonths={2}
                modifiers={{
                  today: new Date(),
                  booked: dateStatuses?.filter(ds => ds.status === "BOOKED").map(ds => ds.date) || [],
                  reserved: dateStatuses?.filter(ds => ds.status === "RESERVED").map(ds => ds.date) || [],
                  outOfOrder: dateStatuses?.filter(ds => ds.status === "OUT_OF_ORDER").map(ds => ds.date) || [],
                }}
                modifiersClassNames={{
                  today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                  booked: "bg-blue-100 border-blue-200 text-blue-900 font-semibold rounded-none",
                  reserved: "bg-amber-100 border-amber-200 text-amber-900 font-semibold rounded-none",
                  outOfOrder: "bg-red-100 border-red-200 text-red-900 font-semibold rounded-none",
                }}
                classNames={{
                  day_today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return true;

                  // Find status for this date
                  const status = dateStatuses?.find(ds => {
                    const d = new Date(ds.date);
                    return d.getFullYear() === date.getFullYear() &&
                      d.getMonth() === date.getMonth() &&
                      d.getDate() === date.getDate();
                  });

                  if (!status) return false;

                  // Allow OOS start date as checkout if it's the start date
                  // This is tricky without knowing if it's the first or second click.
                  // For now, let's NOT disable OOS dates completely if they can be checkouts.
                  // But usually OOS means totally unavailable.
                  // Let's just block them and see if the user complains.
                  // Actually, if I block them, they can't select them as checkout.
                  // So let's NOT block them in the 'disabled' function, just highlight them.
                  // This way they can select them, and my checkConflicts will catch it if they try to book an interval that contains them.

                  // RETURN false to NOT disable them so they can be selected as checkout.
                  // (The conflict check on Save will handle the logic)
                  return false;
                }}
              />
            </PopoverContent>
          </Popover>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm" />
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-sm" />
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm" />
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Out of Service</span>
            </div>
          </div>
          {form.checkIn && form.checkOut && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Total duration: {Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
            </p>
          )}
        </div>
      </div>

      {/* PAYMENT SECTION */}
      <div className="p-4 rounded-xl border bg-white shadow-sm">
        <PaymentSection form={form} onChange={onChange} isEdit={isEdit} />
      </div>

    </div>

  );
});

BookingFormComponent.displayName = "BookingFormComponent";