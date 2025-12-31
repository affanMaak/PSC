import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMembers, authAdmin, sendNotification } from "../../config/apis";
import { Switch } from "@/components/ui/switch";

// Mock history for now, can be replaced with real API later if needed
const mockNotificationHistory = [
  { id: 1, date: "2025-11-10", message: "Monthly payment reminder sent", recipients: 15, status: "SENT" },
  { id: 2, date: "2025-11-08", message: "Booking confirmation for Main Hall", recipients: 1, status: "SENT" },
  { id: 3, date: "2025-11-05", message: "Payment received notification", recipients: 3, status: "SENT" },
];

export default function Notifications() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Store full member objects to keep them visible when selected
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  const [sendToAll, setSendToAll] = useState(false);
  const [sendToActive, setSendToActive] = useState(false);
  const [sendToDeactivated, setSendToDeactivated] = useState(false);
  const [sendToBlocked, setSendToBlocked] = useState(false);

  const { toast } = useToast();

  // Fetch members with search
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["members", searchTerm],
    queryFn: () => getMembers({ search: searchTerm }),
    enabled: isCreateOpen, // Only fetch when dialog is open
  });

  const membersList = membersData?.data || [];

  // Combine fetched members and selected members for the table display
  const displayedMembers = useMemo(() => {
    if (!membersList) return selectedMembers;

    // Create a map of currently fetched members
    const fetchedMap = new Map(membersList.map((m: any) => [m.Membership_No, m]));

    // Add selected members to the map if they aren't already there
    selectedMembers.forEach(m => {
      if (!fetchedMap.has(m.Membership_No)) {
        fetchedMap.set(m.Membership_No, m);
      }
    });

    const allKnown = Array.from(fetchedMap.values());

    return allKnown.filter(m => {
      return true;
    });
  }, [membersList, selectedMembers]);


  const { mutate: handleSend, isPending: isSendingNotification } = useMutation({
    mutationFn: async () => {
      // Logic for sending notification
      // Now sending a single request with all flags

      const payload = {
        title: notificationTitle,
        description: messageContent,
        sendToAll,
        sendToActive: sendToActive || false,
        sendToDeactivated: sendToDeactivated || false,
        sendToBlocked: sendToBlocked || false,
        recipients: sendToAll
          ? "ALL"
          : selectedMembers.map(m => m.Membership_No),
      };

      return sendNotification(payload);
    },
    onSuccess: () => {
      toast({ title: "Notifications sent successfully" });
      setIsCreateOpen(false);
      setSelectedMembers([]);
      setNotificationTitle("");
      setMessageContent("");
      setSendToAll(false);
      setSendToActive(false);
      setSendToDeactivated(false);
      setSendToBlocked(false);
      setSearchTerm("");
    },
    onError: () => {
      toast({ title: "Failed to send notification", variant: "destructive" });
    }
  });

  const toggleMember = (member: any) => {
    setSelectedMembers(prev => {
      const exists = prev.some(m => m.Membership_No === member.Membership_No);
      if (exists) {
        return prev.filter(m => m.Membership_No !== member.Membership_No);
      } else {
        return [...prev, member];
      }
    });
  };

  const isSelected = (membershipNo: string) => {
    return selectedMembers.some(m => m.Membership_No === membershipNo);
  }

  // Determine if manual selection should be shown
  // We hide it only if "Send to All" is specifically checked OR if we decide 
  // that status selection also disables manual (user didn't specify, but usually additive).
  // Assuming additive: Users can check "Active" AND select "Some Inactive Guy".
  // However, "Send to All" logically overrides everything.
  const showManualSelection = !sendToAll;

  // Determine button disabled state
  const isSendDisabled =
    !messageContent ||
    !notificationTitle ||
    isSendingNotification ||
    (!sendToAll && !sendToActive && !sendToDeactivated && !sendToBlocked && selectedMembers.length === 0);

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

              <div>
                <Label>Title</Label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Notification Title"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Enter your message here..."
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 py-2">
                  <Switch
                    id="send-to-all"
                    checked={sendToAll}
                    onCheckedChange={(checked) => {
                      setSendToAll(checked);
                      if (checked) {
                        setSendToActive(false);
                        setSendToDeactivated(false);
                        setSendToBlocked(false);
                      }
                    }}
                  />
                  <Label htmlFor="send-to-all">Send to All Members</Label>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Switch
                    id="send-to-active"
                    checked={sendToActive}
                    onCheckedChange={(checked) => {
                      setSendToActive(checked);
                      if (checked) setSendToAll(false);
                    }}
                  />
                  <Label htmlFor="send-to-active">Send to Active</Label>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Switch
                    id="send-to-deactivated"
                    checked={sendToDeactivated}
                    onCheckedChange={(checked) => {
                      setSendToDeactivated(checked);
                      if (checked) setSendToAll(false);
                    }}
                  />
                  <Label htmlFor="send-to-deactivated">Send to Deactivated</Label>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Switch
                    id="send-to-blocked"
                    checked={sendToBlocked}
                    onCheckedChange={(checked) => {
                      setSendToBlocked(checked);
                      if (checked) setSendToAll(false);
                    }}
                  />
                  <Label htmlFor="send-to-blocked">Send to Blocked</Label>
                </div>
              </div>

              {showManualSelection && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Select Recipients (Optional if status selected)</Label>
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
                        {displayedMembers.map((member: any) => (
                          <TableRow key={member.Membership_No}>
                            <TableCell>
                              <Checkbox
                                checked={isSelected(member.Membership_No)}
                                onCheckedChange={() => toggleMember(member)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{member.Name}</TableCell>
                            <TableCell>{member.Membership_No}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{member.Email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{member.Contact_No}</TableCell>
                          </TableRow>
                        ))}
                        {displayedMembers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                              {searchTerm ? "No members found" : "Start typing to search members"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedMembers.length} members
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSend()} disabled={isSendDisabled}>
                <Send className="h-4 w-4 mr-2" />
                {isSendingNotification ? "Sending..." : "Send Notification"}
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
