import { PaymentMode } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";

enum PaymentStatus {
    UNPAID,
    HALF_PAID,
    PAID
}
// enum PaymentMode {
//     CASH,
//     ONLINE
// }

export class BookingDto{
    
    @IsOptional()
    id?: string
    @IsNotEmpty({message: "Member must be provided"})
    membershipNo: string
    @IsNotEmpty({message: "Booking Category must be specified"})
    category: string
    @IsOptional()
    subCategoryId?: string | null
    @IsOptional()
    entityId?: string | null
    @IsOptional()
    checkIn?: string | null
    @IsOptional()
    checkOut?: string | null
    @IsOptional()
    bookingDate?: string | null
    @IsOptional()
    timeSlot?: string | null
    @IsOptional()
    photoshootTime?: string | null
    @IsOptional()
    eventTime?: string | null
    @IsOptional()
    eventType?: string | null
    @IsOptional()
    guestsCount?: string | null
    @IsNotEmpty({message: "Total Price must be specified"})
    totalPrice: string
    @IsEnum(PaymentStatus, { message: "Payment status must be UNPAID, HALF_PAID, or PAID" })
    paymentStatus: PaymentStatus
    @IsNotEmpty({message: "Pricing type either be Member or Guest"})
    pricingType: string
    @IsOptional()
    paidAmount: string | number
    @IsNotEmpty({message: "Pending amount must be specified"})
    pendingAmount: string |number
    @IsEnum(PaymentMode, {message: "payment mode must be provided"})
    paymentMode: PaymentMode
    @IsOptional()
    prevRoomId?:string|null

}