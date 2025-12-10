import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Receipt, XCircle, Loader2, NotepadText } from "lucide-react";
import { Booking } from "@/types/room-booking.type";

interface BookingsTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onEdit: (booking: Booking) => void;
  onDetail: (booking: Booking) => void;
  onViewVouchers: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  getPaymentBadge: (status: string) => React.ReactNode;
}

export const BookingsTable = React.memo(({
  bookings,
  isLoading,
  onEdit,
  onDetail,
  onViewVouchers,
  onCancel,
  getPaymentBadge,
}: BookingsTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="text-center py-32 text-muted-foreground text-lg">
            No bookings found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mem #</TableHead>
              <TableHead>Room #</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking: Booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.Membership_No}
                </TableCell>
                <TableCell>{booking.room?.roomNumber}</TableCell>
                <TableCell>
                  {new Date(booking.checkIn).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(booking.checkOut).toLocaleString()}
                </TableCell>
                <TableCell>
                  PKR {booking.totalPrice?.toLocaleString()}
                </TableCell>
                <TableCell>
                  {getPaymentBadge(booking.paymentStatus)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost"
                      size="icon"
                      onClick={() => onDetail(booking)}
                      title="Booking Details">
                        <NotepadText/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(booking)}
                      title="Edit Booking"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {(booking.paymentStatus === "PAID" ||
                      booking.paymentStatus === "HALF_PAID") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewVouchers(booking)}
                        title="View Vouchers"
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => onCancel(booking)}
                      title="Cancel Booking"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

BookingsTable.displayName = "BookingsTable";