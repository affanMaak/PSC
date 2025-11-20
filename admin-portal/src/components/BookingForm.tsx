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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      {/* Member Search */}
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

      {/* Room Type */}
      <div>
        <Label>Room Type *</Label>
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
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes?.map((type: RoomType) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.type} - PKR{" "}
                  {parseInt(type.priceMember).toLocaleString()}{" "}
                  (Member) / PKR{" "}
                  {parseInt(type.priceGuest).toLocaleString()} (Guest)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Room Number */}
      <div>
        <Label>Room Number *</Label>
        <Select
          value={form.roomId}
          onValueChange={(val) => onChange("roomId", val)}
          disabled={!form.roomTypeId || availableRooms.length === 0}
        >
          <SelectTrigger className="mt-2">
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
        <Label>Pricing Type</Label>
        <Select
          value={form.pricingType}
          onValueChange={(val) => onChange("pricingType", val)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guest Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Number of Adults *</Label>
          <FormInput
            label=""
            type="number"
            value={form.numberOfAdults}
            onChange={(val) => onChange("numberOfAdults", val)}
            min="1"
            max="4"
          />
        </div>
        <div>
          <Label>Number of Children</Label>
          <FormInput
            label=""
            type="number"
            value={form.numberOfChildren}
            onChange={(val) => onChange("numberOfChildren", val)}
            min="0"
            max="4"
          />
        </div>
        <SpecialRequestsInput
          value={form.specialRequests || ""}
          onChange={(val) => onChange("specialRequests", val)}
        />
      </div>

      {/* Dates */}
      <div>
        <Label>Check-in *</Label>
        <DatePickerInput
          label=""
          value={form.checkIn}
          onChange={(val) => onChange("checkIn", val)}
          dateStatuses={dateStatuses}
          placeholder="Select check-in date"
        />
      </div>
      <div>
        <Label>Check-out *</Label>
        <DatePickerInput
          label=""
          value={form.checkOut}
          onChange={(val) => onChange("checkOut", val)}
          dateStatuses={dateStatuses}
          placeholder="Select check-out date"
        />
      </div>

      {/* Payment Section */}
      <PaymentSection form={form} onChange={onChange} isEdit={isEdit} />
    </div>
  );
});

BookingFormComponent.displayName = "BookingFormComponent";