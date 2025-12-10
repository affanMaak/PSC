export interface AffiliatedClub {
    id: number;
    name: string;
    location?: string;
    contactNo?: string;
    email?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    requests?: AffiliatedClubRequest[];
}

export interface AffiliatedClubRequest {
    id: number;
    membershipNo: string;
    affiliatedClubId: number;
    affiliatedClub?: AffiliatedClub;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    guestCount?: number;
    purpose?: string;
    requestedDate: string;
    approvedDate?: string;
    rejectedDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAffiliatedClubDto {
    name: string;
    location?: string;
    contactNo?: string;
    email?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateAffiliatedClubDto extends CreateAffiliatedClubDto {
    id: number;
}
