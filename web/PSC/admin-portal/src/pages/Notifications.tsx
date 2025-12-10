import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { mockMembers } from "@/lib/mockData";

const messageTemplates = [
  { id: "monthly_payment", title: "Monthly Payment Reminder", content: "Dear {memberName}, this is a reminder that your monthly payment of PKR {amount} is due. Please make the payment at your earliest convenience." },
  { id: "booking_confirmation", title: "Booking Confirmation", content: "Dear {memberName}, your booking for {bookingType} on {date} has been confirmed. Thank you!" },
  { id: "payment_received", title: "Payment Received", content: "Dear {memberName}, we have received your payment of PKR {amount}. Thank you for your prompt payment." },
  { id: "custom", title: "Custom Message", content: "" },
];

const mockNotificationHistory = [
  { id: 1, date: "2025-11-10", message: "Monthly payment reminder sent", recipients: 15, status: "SENT" },
  { id: 2, date: "2025-11-08", message: "Booking confirmation for Main Hall", recipients: 1, status: "SENT" },
  { id: 3, date: "2025-11-05", message: "Payment received notification", recipients: 3, status: "SENT" },
];

export default function Notifications() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = messageTemplates.find(t => t.id === templateId);
    setMessageContent(template?.content || "");
  };

  const toggleMember = (membershipNo: string) => {
    setSelectedMembers(prev =>
      prev.includes(membershipNo)
        ? prev.filter(m => m !== membershipNo)
        : [...prev, membershipNo]
    );
  };

  const selectAllMembers = () => {
    const filtered = mockMembers.filter(m =>
      m.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.Membership_No.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSelectedMembers(filtered.map(m => m.Membership_No));
  };

  const filteredMembers = mockMembers.filter(m =>
    m.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Membership_No.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = () => {
    toast({ title: `Notification sent to ${selectedMembers.length} members` });
    setIsCreateOpen(false);
    setSelectedMembers([]);
    setMessageContent("");
    setSelectedTemplate("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h2>
          <p className="text-muted-foreground">Send messages and notifications to members</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Message Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Message Content</Label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Enter your message here..."
                  className="mt-2 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use placeholders: {"{memberName}"}, {"{amount}"}, {"{date}"}, {"{bookingType}"}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Select Recipients</Label>
                  <Button variant="outline" size="sm" onClick={selectAllMembers}>
                    Select All Filtered
                  </Button>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members by name or membership number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="border rounded-md max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Membership No</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.Membership_No}>
                          <TableCell>
                            <Checkbox
                              checked={selectedMembers.includes(member.Membership_No)}
                              onCheckedChange={() => toggleMember(member.Membership_No)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{member.Name}</TableCell>
                          <TableCell>{member.Membership_No}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{member.Email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{member.Contact_No}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedMembers.length} members
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleSend} disabled={selectedMembers.length === 0 || !messageContent}>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockNotificationHistory.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.date}</TableCell>
                    <TableCell className="font-medium">{notification.message}</TableCell>
                    <TableCell>{notification.recipients} members</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-success-foreground">{notification.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
