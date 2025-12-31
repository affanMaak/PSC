import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt } from "lucide-react";
import { BookingForm } from "@/types/room-booking.type";
import { PaidAmountInput } from "./FormInputs";

interface PaymentSectionProps {
  form: BookingForm;
  onChange: (field: keyof BookingForm, value: any) => void;
  isEdit?: boolean;
}

export const PaymentSection = React.memo(({
  form,
  onChange,
  isEdit = false,
}: PaymentSectionProps) => {
  // Calculate accounting values in real-time
  const calculateRealTimeAccounting = () => {
    const total = form.totalPrice || 0;
    const paid = form.paidAmount || 0;
    let pending = total - paid;

    // Ensure pending amount is never negative
    if (pending < 0) pending = 0;

    return {
      total,
      paid,
      pending
    };
  };

  const accounting = calculateRealTimeAccounting();

  const handlePaidAmountChange = (value: number) => {
    console.log('Real-time paid amount change:', value);

    // Update paid amount immediately
    onChange("paidAmount", value);

    // Auto-update payment status based on amount
    if (value === accounting.total && form.paymentStatus !== "PAID") {
      onChange("paymentStatus", "PAID");
    } else if (value > 0 && value < accounting.total && form.paymentStatus !== "HALF_PAID") {
      onChange("paymentStatus", "HALF_PAID");
    } else if (value === 0 && form.paymentStatus !== "UNPAID") {
      onChange("paymentStatus", "UNPAID");
    }
  };

  return (
    <div className="md:col-span-2 border-t pt-4">
      <Label className="text-lg font-semibold">Payment Details</Label>

      <div className="mt-4">
        <Label>Total Amount</Label>
        <Input
          type="text"
          className="mt-2 font-bold text-lg"
          value={`PKR ${accounting.total.toLocaleString()}`}
          disabled
        />
      </div>

      <div className="mt-4">
        <Label>Payment Status</Label>
        <Select
          value={form.paymentStatus}
          onValueChange={(val) => onChange("paymentStatus", val)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="HALF_PAID">Half Paid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="TO_BILL">To Bill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show paid amount input for all statuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label>Paid Amount (PKR) *</Label>
          <PaidAmountInput
            value={form.paidAmount || 0}
            onChange={handlePaidAmountChange}
            max={accounting.total}
            disabled={form.paymentStatus === "PAID"}
          />
          {form.paymentStatus === "HALF_PAID" && (
            <div className="text-xs text-muted-foreground mt-1">
              Enter amount between 1 and {accounting.total - 1}
            </div>
          )}
        </div>
        <div>
          <Label>Pending Amount (PKR)</Label>
          <Input
            type="number"
            value={accounting.pending}
            className="mt-2 font-semibold"
            readOnly
            disabled
            style={{
              color: accounting.pending > 0 ? '#dc2626' : '#16a34a',
              fontWeight: 'bold'
            }}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {accounting.pending > 0 ? 'Amount remaining' : 'Fully paid'}
          </div>
        </div>
      </div>

      {/* Real-time Accounting Summary */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Label className="text-lg font-semibold text-blue-800">
          Live Accounting Summary
        </Label>
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div className="text-blue-700">Total Amount:</div>
          <div className="font-semibold text-right text-blue-700">
            PKR {accounting.total.toLocaleString()}
          </div>

          <div className="text-green-700">Paid Amount (DR):</div>
          <div className="font-semibold text-right text-green-700">
            PKR {accounting.paid.toLocaleString()}
          </div>

          <div className="text-red-700">Pending Amount (CR):</div>
          <div className="font-semibold text-right text-red-700">
            PKR {accounting.pending.toLocaleString()}
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          Updates in real-time as you type
        </div>
      </div>

      {/* Voucher Information */}
      {(form.paymentStatus === "PAID" || form.paymentStatus === "HALF_PAID") && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <Receipt className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              {form.paymentStatus === "PAID"
                ? "Full Payment Voucher will be generated automatically"
                : "Half Payment Voucher will be generated automatically"}
            </span>
          </div>
        </div>
      )}
      {form.paymentStatus === "TO_BILL" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Receipt className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">
              Remaining amount will be added to Member's Ledger/Balance
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

PaymentSection.displayName = "PaymentSection";