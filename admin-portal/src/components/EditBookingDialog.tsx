import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Loader2 } from "lucide-react";
import { Booking, BookingForm, RoomType, Room, DateStatus } from "@/types/room-booking.type";
import { FormInput, DatePickerInput, SpecialRequestsInput } from "./FormInputs";
import { PaymentSection } from "./PaymentSection";

interface EditBookingDialogProps {
  editBooking: Booking | null;
  editForm: BookingForm;
  onEditFormChange: (field: keyof BookingForm, value: any) => void;
  roomTypes: RoomType[];
  editAvailableRooms: Room[];
  isLoadingRoomTypes: boolean;
  dateStatuses: DateStatus[];
  onUpdate: () => void;
  onClose: () => void;
  isUpdating: boolean;
}

interface EditBookingDialogProps {
  editBooking: Booking | null;
  editForm: BookingForm;
  onEditFormChange: (field: keyof BookingForm, value: any) => void;
  roomTypes: RoomType[];
  editAvailableRooms: Room[];
  isLoadingRoomTypes: boolean;
  dateStatuses: DateStatus[];
  onUpdate: () => void;
  onClose: () => void;
  isUpdating: boolean;
}

export const EditBookingDialog = React.memo(({
  editBooking,
  editForm,
  onEditFormChange,
  roomTypes,
  editAvailableRooms,
  isLoadingRoomTypes,
  dateStatuses,
  onUpdate,
  onClose,
  isUpdating,
}: EditBookingDialogProps) => {
  return (
    <Dialog open={!!editBooking} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Member Information Display (Read-only) */}
          <div className="md:col-span-2">
            <Label>Member Information</Label>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    {editBooking?.member?.Name || editBooking?.memberName}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {editBooking?.Membership_No &&
                      `Membership: #${editBooking.Membership_No}`}
                    {editBooking?.member?.Balance !== undefined && (
                      <div className="mt-1 space-y-1">
                        <Badge
                          variant={
                            editBooking.member.Balance >= 0
                              ? "outline"
                              : "destructive"
                          }
                          className="bg-blue-100 text-blue-800"
                        >
                          Account Balance: PKR{" "}
                          {editBooking.member.Balance.toLocaleString()}
                        </Badge>
                        <div className="text-xs">
                          <span className="text-green-700">
                            DR: PKR{" "}
                            {editBooking.member.drAmount?.toLocaleString() ||
                              "0"}
                          </span>
                          {" • "}
                          <span className="text-red-700">
                            CR: PKR{" "}
                            {editBooking.member.crAmount?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800"
                >
                  Current Booking
                </Badge>
              </div>
            </div>
          </div>

          {/* Room Type */}
          <div>
            <Label>Room Type *</Label>
            {isLoadingRoomTypes ? (
              <div className="h-10 bg-muted animate-pulse rounded-md mt-2" />
            ) : (
              <Select
                value={editForm.roomTypeId}
                onValueChange={(val) => {
                  onEditFormChange("roomTypeId", val);
                  onEditFormChange("roomId", "");
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={
                      editForm.roomTypeId ? "" : "Select room type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes?.map((type: RoomType) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.type} - PKR{" "}
                      {parseInt(type.priceMember).toLocaleString()} (Member) /
                      PKR {parseInt(type.priceGuest).toLocaleString()} (Guest)
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
              value={editForm.roomId}
              onValueChange={(val) => onEditFormChange("roomId", val)}
              disabled={
                !editForm.roomTypeId || editAvailableRooms.length === 0
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={
                    !editForm.roomTypeId
                      ? "Select type first"
                      : editAvailableRooms.length === 0
                        ? "No rooms available"
                        : "Select room"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {editAvailableRooms.map((room: Room) => (
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
              value={editForm.pricingType}
              onValueChange={(val) =>
                onEditFormChange("pricingType", val)
              }
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
                value={editForm.numberOfAdults}
                onChange={(val) => onEditFormChange("numberOfAdults", val)}
                min="1"
                max="4"
              />
            </div>
            <div>
              <Label>Number of Children</Label>
              <FormInput
                label=""
                type="number"
                value={editForm.numberOfChildren}
                onChange={(val) => onEditFormChange("numberOfChildren", val)}
                min="0"
                max="4"
              />
            </div>
            <SpecialRequestsInput
              value={editForm.specialRequests || ""}
              onChange={(val) => onEditFormChange("specialRequests", val)}
            />
          </div>

          {/* Dates - Using the same DatePickerInput as create dialog */}
          <div>
            <Label>Check-in *</Label>
            <DatePickerInput
              label=""
              value={editForm.checkIn}
              onChange={(val) => onEditFormChange("checkIn", val)}
              dateStatuses={dateStatuses}
              placeholder="Select check-in date"
            />
          </div>
          <div>
            <Label>Check-out *</Label>
            <DatePickerInput
              label=""
              value={editForm.checkOut}
              onChange={(val) => onEditFormChange("checkOut", val)}
              dateStatuses={dateStatuses}
              placeholder="Select check-out date"
            />
          </div>

          {/* Payment Section */}
          <PaymentSection
            form={editForm}
            onChange={onEditFormChange}
            isEdit={true}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

EditBookingDialog.displayName = "EditBookingDialog";