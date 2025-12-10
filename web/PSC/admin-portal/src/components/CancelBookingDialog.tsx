import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Booking } from "@/types/room-booking.type";

interface CancelBookingDialogProps {
  cancelBooking: Booking | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const CancelBookingDialog = React.memo(({
  cancelBooking,
  onClose,
  onConfirm,
  isDeleting,
}: CancelBookingDialogProps) => {
  return (
    <Dialog open={!!cancelBooking} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
        </DialogHeader>
        <p className="py-4">
          Are you sure you want to cancel this booking for{" "}
          <strong>{cancelBooking?.memberName}</strong>?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            No
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              "Cancel Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CancelBookingDialog.displayName = "CancelBookingDialog";