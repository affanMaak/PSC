import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, FileText, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportVoucherPDF } from "@/lib/pdfExport";
import { getAccountMembers, getMemberVouchers, getMemberBookings } from "../../config/apis";

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [memberVouchers, setMemberVouchers] = useState<any[]>([]);
  const [memberBookings, setMemberBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch members on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  // Fetch vouchers and bookings when member is selected
  useEffect(() => {
    if (selectedMember) {
      fetchMemberVouchers(selectedMember.Membership_No);
      fetchMemberBookings(selectedMember.Membership_No);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getAccountMembers();
      setMembers(data.data || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberVouchers = async (membershipNo: string) => {
    try {
      const data = await getMemberVouchers(membershipNo);
      setMemberVouchers(data || []);
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      setMemberVouchers([]);
    }
  };

  const fetchMemberBookings = async (membershipNo: string) => {
    try {
      const data = await getMemberBookings(membershipNo);
      setMemberBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setMemberBookings([]);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.Membership_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
      case "CONFIRMED":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "HALF_PAID":
      case "PENDING":
        return <Badge className="bg-warning text-warning-foreground">Half Paid</Badge>;
      case "UNPAID":
        return <Badge variant="destructive">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Member Accounts</h2>
        <p className="text-muted-foreground">View member payment vouchers and booking history</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, membership no, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card
            key={member.Sno}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedMember(member)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.Name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.Membership_No}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className={member.Balance < 0 ? "text-destructive font-medium" : "font-medium"}>
                    PKR {member.Balance?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bookings:</span>
                  <span className="font-medium">{member.totalBookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Booking:</span>
                  <span className="font-medium">
                    {member.lastBookingDate ? formatDate(member.lastBookingDate) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={member.Status === "ACTIVE" ? "default" : "secondary"}>
                    {member.Status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment Vouchers & Booking History - {selectedMember?.Name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Membership No</p>
                <p className="font-medium">{selectedMember?.Membership_No}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`font-medium ${selectedMember?.Balance < 0 ? "text-destructive" : ""}`}>
                  PKR {selectedMember?.Balance?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="font-medium">{selectedMember?.totalBookings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedMember?.Status === "ACTIVE" ? "default" : "secondary"}>
                  {selectedMember?.Status}
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="vouchers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vouchers">Payment Vouchers</TabsTrigger>
                <TabsTrigger value="bookings">Booking History</TabsTrigger>
              </TabsList>

              <TabsContent value="vouchers">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberVouchers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No vouchers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      memberVouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell className="font-medium">{voucher.id}</TableCell>
                          <TableCell>{formatDate(voucher.issued_at || voucher.created_at)}</TableCell>
                          <TableCell>{voucher.voucher_type || voucher.booking_type}</TableCell>
                          <TableCell>PKR {voucher.amount?.toLocaleString() || 0}</TableCell>
                          <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => exportVoucherPDF(voucher)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="bookings">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      memberBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.type}</TableCell>
                          <TableCell>{booking.name}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>PKR {booking.amount?.toLocaleString() || 0}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
