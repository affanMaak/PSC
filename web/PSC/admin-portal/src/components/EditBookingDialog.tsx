import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Loader2 } from "lucide-react";
import { Booking, BookingForm, RoomType, Room, DateStatus } from "@/types/room-booking.type";
import { BookingFormComponent } from "./BookingForm";

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
          <DialogTitle>Edit Room Booking</DialogTitle>
        </DialogHeader>

        {/* Member summary (read-only) */}
        {editBooking && (
          <div className="p-4 rounded-xl border bg-blue-50 shadow-sm mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  {editBooking.member?.Name || editBooking.memberName}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {editBooking.Membership_No && `Membership: #${editBooking.Membership_No}`}
                  {editBooking.member && editBooking.member.Balance !== undefined && (
                    <div className="mt-1 space-y-1">
                      <Badge
                        variant={editBooking.member.Balance >= 0 ? "outline" : "destructive"}
                        className="bg-blue-100 text-blue-800"
                      >
                        Account Balance: PKR {editBooking.member.Balance.toLocaleString()}
                      </Badge>
                      <div className="text-xs">
                        <span className="text-green-700">
                          DR: PKR {editBooking.member.drAmount?.toLocaleString() || "0"}
                        </span>
                        {" • "}
                        <span className="text-red-700">
                          CR: PKR {editBooking.member.crAmount?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Current Booking
              </Badge>
            </div>
          </div>
        )}

        {/* Main edit form: reuse BookingFormComponent so UI matches create form */}
        <BookingFormComponent
          form={editForm}
          onChange={onEditFormChange}
          roomTypes={roomTypes}
          availableRooms={editAvailableRooms}
          isLoadingRoomTypes={isLoadingRoomTypes}
          memberSearch=""
          onMemberSearchChange={() => { }}
          showMemberResults={false}
          searchResults={[]}
          isSearching={false}
          selectedMember={null}
          onSelectMember={() => { }}
          onClearMember={() => { }}
          onSearchFocus={() => { }}
          dateStatuses={dateStatuses}
          isEdit={true}
        />

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
