import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAffiliatedClubs, createAffiliatedClubRequest, updateAffiliatedClubRequestStatus } from "../../../config/apis";
import { UnifiedDatePicker } from "@/components/UnifiedDatePicker";
import { format } from "date-fns";
import type { AffiliatedClub } from "@/types/affiliated-club.type";

export default function ClubRequestForm() {
    const [selectedClubId, setSelectedClubId] = useState("");
    const [membershipNo, setMembershipNo] = useState("");
    const [requestedDate, setRequestedDate] = useState<Date | undefined>(undefined);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch all clubs
    const { data: clubs = [], isLoading: isLoadingClubs } = useQuery<AffiliatedClub[]>({
        queryKey: ["affiliatedClubs"],
        queryFn: getAffiliatedClubs,
        retry: 1,
    });

    // Create request mutation
    const createRequestMutation = useMutation({
        mutationFn: createAffiliatedClubRequest,
        onSuccess: () => {
            toast({ title: "Request submitted successfully" });
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: "Failed to submit request",
                description: error?.message || "Please try again",
                variant: "destructive",
            });
        },
    });
   

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!selectedClubId) {
            toast({
                title: "Please select a club",
                variant: "destructive",
            });
            return;
        }
        console.log(membershipNo);
        if (!membershipNo) {
            toast({
                title: "Please enter membership number",
                variant: "destructive",
            });
            return;
        }

        if (!requestedDate) {
            toast({
                title: "Please select requested date",
                variant: "destructive",
            });
            return;
        }

        // Submit request
        const payload = {
            affiliatedClubId: Number(selectedClubId),
            membershipNo: membershipNo,
        };

        createRequestMutation.mutate(payload);
    };

    const resetForm = () => {
        setSelectedClubId("");
        setMembershipNo("");
        setRequestedDate(undefined);
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Request Club Facility Access</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Submit a request to use affiliated club facilities
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Club Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="club">Select Club *</Label>
                            {isLoadingClubs ? (
                                <div className="h-10 bg-muted animate-pulse rounded-md" />
                            ) : (
                                <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a club" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clubs
                                            .filter((club) => club.isActive)
                                            .map((club) => (
                                                <SelectItem key={club.id} value={club.id.toString()}>
                                                    {club.name} {club.location && `- ${club.location}`}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Membership Number */}
                        <div className="space-y-2">
                            <Label htmlFor="membershipNo">Membership Number *</Label>
                            <Input
                                id="membershipNo"
                                value={membershipNo}
                                onChange={(e) => setMembershipNo(e.target.value)}
                                placeholder="Enter your membership number"
                                required
                            />
                        </div>

                        {/* Requested Date */}
                        <div className="space-y-2">
                            <Label>Requested Date *</Label>
                            <UnifiedDatePicker
                                value={requestedDate}
                                onChange={setRequestedDate}
                                placeholder="Select requested date"
                            />
                        </div>

                       

                        {/* Selected Club Info */}
                        {selectedClubId && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Selected Club Information</h4>
                                {clubs.find((c) => c.id.toString() === selectedClubId) && (
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <p>
                                            <strong>Name:</strong>{" "}
                                            {clubs.find((c) => c.id.toString() === selectedClubId)?.name}
                                        </p>
                                        {clubs.find((c) => c.id.toString() === selectedClubId)?.location && (
                                            <p>
                                                <strong>Location:</strong>{" "}
                                                {clubs.find((c) => c.id.toString() === selectedClubId)?.location}
                                            </p>
                                        )}
                                        {clubs.find((c) => c.id.toString() === selectedClubId)?.contactNo && (
                                            <p>
                                                <strong>Contact:</strong>{" "}
                                                {clubs.find((c) => c.id.toString() === selectedClubId)?.contactNo}
                                            </p>
                                        )}
                                        {clubs.find((c) => c.id.toString() === selectedClubId)?.description && (
                                            <p>
                                                <strong>Description:</strong>{" "}
                                                {clubs.find((c) => c.id.toString() === selectedClubId)?.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="flex-1"
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={createRequestMutation.isPending}
                            >
                                {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
