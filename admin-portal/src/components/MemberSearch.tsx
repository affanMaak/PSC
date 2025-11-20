import React, { useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Check, XCircle, Loader2 } from "lucide-react";
import { Member } from "@/types/room-booking.type";

interface MemberSearchComponentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showResults: boolean;
  searchResults: Member[];
  isSearching: boolean;
  selectedMember: Member | null;
  onSelectMember: (member: Member) => void;
  onClearMember: () => void;
  onFocus: () => void;
}

export const MemberSearchComponent = React.memo(({
  searchTerm,
  onSearchChange,
  showResults,
  searchResults,
  isSearching,
  selectedMember,
  onSelectMember,
  onClearMember,
  onFocus,
}: MemberSearchComponentProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handleInputFocus = useCallback(() => {
    onFocus();
  }, [onFocus]);

  return (
    <div className="md:col-span-2 relative">
      <Label>Select Member *</Label>
      <div className="relative mt-2">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search member by name, email, or membership number..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-10"
        />
        {selectedMember && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={onClearMember}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                Searching members...
              </span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((member: Member) => (
              <div
                key={member.id}
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b ${
                  selectedMember?.id === member.id ? "bg-blue-50" : ""
                }`}
                onClick={() => onSelectMember(member)}
              >
                <User className="h-4 w-4 text-muted-foreground mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center justify-between">
                    <span>{member.Name}</span>
                    {member.Balance !== undefined && (
                      <Badge
                        variant={
                          member.Balance >= 0 ? "outline" : "destructive"
                        }
                        className="ml-2"
                      >
                        Balance: PKR {member.Balance.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {member.Membership_No &&
                      `Membership #: ${member.Membership_No}`}
                    {member.membershipNumber &&
                      `Membership #: ${member.membershipNumber}`}
                    {member.email && ` • Email: ${member.email}`}
                    {member.phone && ` • Phone: ${member.phone}`}
                  </div>
                </div>
                {selectedMember?.id === member.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No members found
            </div>
          )}
        </div>
      )}

      {/* Selected Member Display */}
      {selectedMember && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm flex items-center">
                <User className="h-4 w-4 mr-2 text-green-600" />
                {selectedMember.Name}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {selectedMember.Membership_No &&
                  `Membership: #${selectedMember.Membership_No}`}
                {selectedMember.membershipNumber &&
                  `Membership: #${selectedMember.membershipNumber}`}
                {selectedMember.Balance !== undefined && (
                  <div className="mt-1 space-y-1">
                    <Badge
                      variant={
                        selectedMember.Balance >= 0
                          ? "outline"
                          : "destructive"
                      }
                      className="bg-green-100 text-green-800"
                    >
                      Account Balance: PKR{" "}
                      {selectedMember.Balance.toLocaleString()}
                    </Badge>
                    <div className="text-xs">
                      <span className="text-green-700">
                        DR: PKR{" "}
                        {selectedMember.drAmount?.toLocaleString() || "0"}
                      </span>
                      {" • "}
                      <span className="text-red-700">
                        CR: PKR{" "}
                        {selectedMember.crAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Selected
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
});

MemberSearchComponent.displayName = "MemberSearchComponent";