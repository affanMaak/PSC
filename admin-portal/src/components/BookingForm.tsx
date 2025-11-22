import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomType, Room, BookingForm, DateStatus } from "@/types/room-booking.type";
import { FormInput, DatePickerInput, SpecialRequestsInput } from "./FormInputs";
import { PaymentSection } from "./PaymentSection";
import { MemberSearchComponent } from "./MemberSearch";
import { Member } from "@/types/room-booking.type";

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
    <div className="space-y-8 py-4">

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

      {/* GUEST INFORMATION */}
      <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Guest Information</h3>

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

        </div>
      </div>

      {/* DATES */}
      <div className="p-4 rounded-xl border bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Stay Dates</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div>
            <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
              Check-in *
            </Label>
            <DatePickerInput
              label=""
              value={form.checkIn}
              onChange={(val) => onChange("checkIn", val)}
              // Use the currently selected room (with its reservations/bookings)
              rooms={
                form.roomId
                  ? availableRooms.filter((room: Room) => room.id.toString() === form.roomId)
                  : []
              }
              placeholder="Select check-in date"
              isCheckout={false}
            />
          </div>

          {/* Check-out Date */}
          <div>
            <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
              Check-out *
            </Label>
            <DatePickerInput
              label=""
              value={form.checkOut}
              onChange={(val) => onChange("checkOut", val)}
              rooms={
                form.roomId
                  ? availableRooms.filter((room: Room) => room.id.toString() === form.roomId)
                  : []
              }
              placeholder="Select check-out date"
              isCheckout={true}
            />
          </div>

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