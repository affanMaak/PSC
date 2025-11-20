import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt } from "lucide-react";
import { Voucher, Booking } from "@/types/room-booking.type";

interface VouchersDialogProps {
  viewVouchers: Booking | null;
  onClose: () => void;
  vouchers: Voucher[];
  isLoadingVouchers: boolean;
}

export const VouchersDialog = React.memo(({
  viewVouchers,
  onClose,
  vouchers,
  isLoadingVouchers,
}: VouchersDialogProps) => {
  const getVoucherBadge = (type: string) => {
    switch (type) {
      case "FULL_PAYMENT":
        return <Badge className="bg-green-100 text-green-800">Full Payment</Badge>;
      case "HALF_PAYMENT":
        return <Badge className="bg-blue-100 text-blue-800">Half Payment</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={!!viewVouchers} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Vouchers</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Vouchers for booking #{viewVouchers?.id} - {viewVouchers?.memberName}
          </p>

          {isLoadingVouchers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vouchers found for this booking</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {vouchers.map((voucher: Voucher) => (
                <div key={voucher.id} className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getVoucherBadge(voucher.voucher_type)}
                        {getStatusBadge(voucher.status)}
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        Voucher #: {voucher.voucher_no}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        PKR {parseFloat(voucher.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {voucher.payment_mode.toLowerCase()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <div className="font-medium">Booking Type</div>
                      <div>{voucher.booking_type}</div>
                    </div>
                    <div>
                      <div className="font-medium">Membership No</div>
                      <div>{voucher.membership_no}</div>
                    </div>
                    <div>
                      <div className="font-medium">Issued By</div>
                      <div>{voucher.issued_by}</div>
                    </div>
                    <div>
                      <div className="font-medium">Issued At</div>
                      <div>
                        {new Date(voucher.issued_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {voucher.transaction_id && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium">Transaction ID</div>
                      <div className="font-mono text-muted-foreground">
                        {voucher.transaction_id}
                      </div>
                    </div>
                  )}

                  {voucher.remarks && (
                    <div className="mt-3 p-2 bg-white border rounded text-sm">
                      <div className="font-medium">Remarks</div>
                      <div className="text-muted-foreground">
                        {voucher.remarks}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

VouchersDialog.displayName = "VouchersDialog";