import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CalendarIcon,
    Users,
    Baby,
    CheckCircle,
    XCircle,
    CreditCard,
    AlertCircle,
    FileText,
    Clock,
    Copy
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {getRoomTypes, generateInvoice } from "../../../config/apis";
import { useToast } from "@/hooks/use-toast";

export default function RoomTypeDatePicker() {
    const { toast } = useToast();
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isAvailable, setIsAvailable] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [paymentInputs, setPaymentInputs] = useState({
        invoiceNumber: "",
        totalPayment: ""
    });
    const [formData, setFormData] = useState({
        pricingType: "member",
        numberOfAdults: 1,
        numberOfChildren: 0,
        numberOfRooms: 1,
        specialRequest: "",
    });

    useEffect(() => {
        loadRoomTypes();
    }, []);

    // Auto-check availability when both dates are selected
    useEffect(() => {
        if (selectedRoomType && fromDate && toDate) {
            const timer = setTimeout(() => {
                checkAvailability();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [selectedRoomType, fromDate, toDate]);

    // Reset number of rooms when availability changes
    useEffect(() => {
        if (isAvailable && availableRooms.length > 0) {
            setFormData(prev => ({
                ...prev,
                numberOfRooms: Math.min(prev.numberOfRooms, availableRooms.length)
            }));
        }
    }, [isAvailable, availableRooms.length]);

    const loadRoomTypes = async () => {
        setLoading(true);
        try {
            const data = await getRoomTypes();
            setRoomTypes(data);
        } catch (error) {
            toast({
                title: "Error loading room types",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFromDate = (date) => {
        if (!date) return;
        setFromDate(date);
        if (toDate && toDate < date) {
            setToDate(null);
            setAvailableRooms([]);
            setIsAvailable(null);
        }
    };

    const handleToDate = (date) => {
        if (!date) return;
        if (fromDate && date < fromDate) {
            toast({
                title: "Invalid date range",
                description: "End date cannot be before start date",
                variant: "destructive",
            });
            return;
        }
        setToDate(date);
    };

    const checkAvailability = async () => {
        if (!selectedRoomType || !fromDate || !toDate) return;

        setCheckingAvailability(true);
        try {
            // const res = await checkAvailRooms(selectedRoomType, {
            //     from: format(fromDate, 'yyyy-MM-dd'),
            //     to: format(toDate, 'yyyy-MM-dd'),
            // });
            const res = []

            // Simply check if the array has any items, don't filter anything
            const hasAvailableRooms = (res || []).length > 0;

            setAvailableRooms(res || []);
            setIsAvailable(hasAvailableRooms);

            if (hasAvailableRooms) {
                toast({
                    title: "Rooms Available!",
                    description: `Found ${(res || []).length} room(s)`,
                    variant: "default",
                });
            } else {
                toast({
                    title: "No Rooms Available",
                    description: "No rooms found for selected dates",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error checking availability",
                description: error.message,
                variant: "destructive",
            });
            setAvailableRooms([]);
            setIsAvailable(false);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleNumberOfRoomsChange = (e) => {
        const value = e.target.value;
        const numRooms = parseInt(value) || 1;
        const maxRooms = availableRooms.length;

        // Allow empty input for better UX
        if (value === "") {
            setFormData((prev: any) => ({ ...prev, numberOfRooms: "" }));
            return;
        }

        if (numRooms > maxRooms) {
            toast({
                title: "Not enough rooms available",
                description: `Only ${maxRooms} room(s) available. Please select ${maxRooms} or fewer rooms.`,
                variant: "destructive",
            });
            // Still update the value but show warning
            setFormData(prev => ({ ...prev, numberOfRooms: numRooms }));
            return;
        }

        if (numRooms < 1) {
            setFormData(prev => ({ ...prev, numberOfRooms: 1 }));
            return;
        }

        setFormData(prev => ({ ...prev, numberOfRooms: numRooms }));
    };

    const handleCheckout = async () => {
        if (!selectedRoomType || !fromDate || !toDate) return;

        // Quick validation before checkout
        const numRooms = formData.numberOfRooms;
        if (numRooms > availableRooms.length || numRooms < 1) {
            toast({
                title: "Invalid number of rooms",
                description: `Please select between 1 and ${availableRooms.length} rooms.`,
                variant: "destructive",
            });
            return;
        }

        setGeneratingInvoice(true);
        try {
            const bookingData = {
                from: fromDate.toISOString().split("T")[0],
                to: toDate.toISOString().split("T")[0],
                numberOfRooms: formData.numberOfRooms,
                numberOfAdults: formData.numberOfAdults,
                numberOfChildren: formData.numberOfChildren,
                pricingType: formData.pricingType,
                specialRequest: formData.specialRequest
            };

            const invoiceResponse = await generateInvoice(selectedRoomType, bookingData);
            setInvoiceData(invoiceResponse.data);
            // setShowInvoiceModal(true);

            // Pre-fill the payment inputs with invoice data
            setPaymentInputs({
                invoiceNumber: invoiceResponse.data.InvoiceNumber || "",
                totalPayment: invoiceResponse.data.Amount || ""
            });

            toast({
                title: "Invoice Generated!",
                description: "Please complete your payment to confirm booking",
                variant: "default",
            });

        } catch (error) {
            toast({
                title: "Error generating invoice",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setGeneratingInvoice(false);
        }
    };

    const handleManualCheckAvailability = async () => {
        await checkAvailability();
    };

    const clearAll = () => {
        setSelectedRoomType("");
        setFromDate(null);
        setToDate(null);
        setAvailableRooms([]);
        setIsAvailable(null);
        setInvoiceData(null);
        setShowInvoiceModal(false);
        setPaymentInputs({
            invoiceNumber: "",
            totalPayment: ""
        });
        setFormData({
            pricingType: "member",
            numberOfAdults: 1,
            numberOfChildren: 0,
            numberOfRooms: 1,
            specialRequest: "",
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Text copied to clipboard",
            variant: "default",
        });
    };

    const handlePaymentInputChange = (field, value) => {
        setPaymentInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePaymentSubmit = () => {
        // Validate payment inputs
        if (!paymentInputs.invoiceNumber || !paymentInputs.totalPayment) {
            toast({
                title: "Missing information",
                description: "Please fill in both invoice number and total payment",
                variant: "destructive",
            });
            return;
        }

        // Here you would typically integrate with your payment gateway
        toast({
            title: "Payment Processing",
            description: "Redirecting to payment gateway...",
            variant: "default",
        });

        // Simulate payment processing
        console.log("Payment details:", paymentInputs);
    };

    const selectedRoomTypeData = roomTypes.find(room => room.id.toString() === selectedRoomType);
    const nights = fromDate && toDate ? Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) : 0;
    const maxRooms = availableRooms.length;
    const calculatedPrice = selectedRoomTypeData && isAvailable && formData.numberOfRooms > 0 ?
        (formData.pricingType === 'member' ? selectedRoomTypeData.priceMember : selectedRoomTypeData.priceGuest) * nights * formData.numberOfRooms
        : 0;

    const hasEnoughRooms = formData.numberOfRooms <= maxRooms && formData.numberOfRooms > 0;
    const isValidNumberOfRooms = formData.numberOfRooms > 0 && formData.numberOfRooms <= maxRooms;

    return (
        <div className="space-y-6 p-6 border rounded-lg bg-background max-w-2xl mx-auto">
            <div>
                <h3 className="text-2xl font-bold">Book Your Stay</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Select your room type, dates, and guest details
                </p>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
                <Label className="text-base">Room Type *</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder={loading ? "Loading room types..." : "Select room type"} />
                    </SelectTrigger>
                    <SelectContent>
                        {roomTypes.map((room) => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{room.type}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Guest: PKR {room.priceGuest?.toLocaleString()} | Member: PKR{" "}
                                        {room.priceMember?.toLocaleString()}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-base">Check-in Date *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {fromDate ? format(fromDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={fromDate || undefined}
                                onSelect={handleFromDate}
                                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="text-base">Check-out Date *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!fromDate}
                                className="w-full h-12 justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {toDate ? format(toDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={toDate || undefined}
                                onSelect={handleToDate}
                                disabled={(d) =>
                                    d < new Date(new Date().setHours(0, 0, 0, 0)) || (fromDate && d < fromDate)
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Guest Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-base">Pricing Type</Label>
                    <Select
                        value={formData.pricingType}
                        onValueChange={(value) => setFormData({ ...formData, pricingType: value })}
                    >
                        <SelectTrigger className="h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Adults
                    </Label>
                    <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.numberOfAdults}
                        onChange={(e) => setFormData({ ...formData, numberOfAdults: parseInt(e.target.value) || 1 })}
                        className="h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Children
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.numberOfChildren}
                        onChange={(e) => setFormData({ ...formData, numberOfChildren: parseInt(e.target.value) || 0 })}
                        className="h-12"
                    />
                </div>
            </div>

            {/* Number of Rooms */}
            {isAvailable && (
                <div className="space-y-2">
                    <Label className="text-base">Number of Rooms</Label>
                    <Input
                        type="number"
                        min="1"
                        max={maxRooms}
                        value={formData.numberOfRooms}
                        onChange={handleNumberOfRoomsChange}
                        className="h-12"
                    />
                    {maxRooms > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            {!isValidNumberOfRooms ? (
                                <>
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-600">
                                        Please select between 1 and {maxRooms} room(s)
                                    </span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">
                                    Maximum {maxRooms} room(s) available for selected dates
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Special Request */}
            <div className="space-y-2">
                <Label className="text-base">Special Requests</Label>
                <Textarea
                    placeholder="Any special requirements or requests..."
                    value={formData.specialRequest}
                    onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                    rows={3}
                />
            </div>

            {/* Availability Status */}
            {isAvailable !== null && (
                <Card className={cn(
                    "border-2",
                    isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                )}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            {isAvailable ? (
                                <>
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                    <div>
                                        <h4 className="font-semibold text-green-800">Rooms Available!</h4>
                                        <p className="text-green-700 text-sm">
                                            {availableRooms.length} room(s) available for your selected dates
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <div>
                                        <h4 className="font-semibold text-red-800">No Rooms Available</h4>
                                        <p className="text-red-700 text-sm">
                                            All rooms of this type are currently reserved, booked, or unavailable for the selected dates
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pricing Summary - Only show when rooms are available */}
            {isAvailable && selectedRoomTypeData && fromDate && toDate && (
                <Card>
                    <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Pricing Summary</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Room Type:</span>
                                <span className="font-medium">{selectedRoomTypeData.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Price per night:</span>
                                <span className="font-medium">
                                    PKR {(formData.pricingType === 'member' ? selectedRoomTypeData.priceMember : selectedRoomTypeData.priceGuest)?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Nights:</span>
                                <span className="font-medium">{nights}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Number of Rooms:</span>
                                <span className="font-medium">
                                    {formData.numberOfRooms}
                                    {!isValidNumberOfRooms && (
                                        <span className="text-red-500 ml-1">(Invalid selection)</span>
                                    )}
                                </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-semibold text-base">
                                    <span>Total Amount:</span>
                                    <span>PKR {isValidNumberOfRooms ? calculatedPrice.toLocaleString() : "0"}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    onClick={clearAll}
                    className="flex-1 h-12"
                    disabled={checkingAvailability || generatingInvoice}
                >
                    Clear All
                </Button>

                {isAvailable ? (
                    <Button
                        onClick={handleCheckout}
                        disabled={generatingInvoice || !isAvailable || !isValidNumberOfRooms}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                    >
                        {generatingInvoice ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Checkout - PKR {isValidNumberOfRooms ? calculatedPrice.toLocaleString() : "0"}
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={handleManualCheckAvailability}
                        disabled={!selectedRoomType || !fromDate || !toDate || checkingAvailability}
                        className="flex-1 h-12"
                    >
                        {checkingAvailability ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                Checking Availability...
                            </>
                        ) : (
                            "Check Availability"
                        )}
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {(loading || checkingAvailability) && (
                <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {checkingAvailability ? "Checking room availability..." : "Loading room types..."}
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice Generated Successfully
                        </DialogTitle>
                        <DialogDescription>
                            Please complete your payment within 3 minutes to confirm your booking
                        </DialogDescription>
                    </DialogHeader>

                    {invoiceData && (
                        <div className="space-y-6">
                            {/* Invoice Header */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Invoice Number:</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold">{invoiceData.InvoiceNumber}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => copyToClipboard(invoiceData.InvoiceNumber)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Due Date:</span>
                                            <p className="font-semibold">
                                                {invoiceData.DueDate}
                                                {/* {format(new Date(invoiceData.DueDate), "PPP 'at' p")} */}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Consumer Number:</span>
                                            <p className="font-semibold">{invoiceData.ConsumerNumber}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Total Amount:</span>
                                            <p className="font-semibold text-lg">PKR {parseInt(invoiceData.Amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Booking Summary */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-3">Booking Summary</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Room Type:</span>
                                            <p className="font-medium">{invoiceData.BookingSummary?.RoomType}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Check-in:</span>
                                            <p className="font-medium">
                                                {invoiceData.BookingSummary?.CheckIn}
                                                {/* {format(new Date(invoiceData.BookingSummary?.CheckIn), "PPP")} */}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Check-out:</span>
                                            <p className="font-medium">
                                                {invoiceData.BookingSummary?.CheckOut}
                                                {/* {format(new Date(invoiceData.BookingSummary?.CheckOut), "PPP")} */}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Nights:</span>
                                            <p className="font-medium">{invoiceData.BookingSummary?.Nights}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Rooms:</span>
                                            <p className="font-medium">{invoiceData.BookingSummary?.Rooms}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Guests:</span>
                                            <p className="font-medium">
                                                {invoiceData.BookingSummary?.Adults} Adult(s), {invoiceData.BookingSummary?.Children} Child(ren)
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Price per Night:</span>
                                            <p className="font-medium">PKR {parseInt(invoiceData.BookingSummary?.PricePerNight).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Amount:</span>
                                            <p className="font-medium">PKR {parseInt(invoiceData.BookingSummary?.TotalAmount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Channels */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-3">Available Payment Channels</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {invoiceData.PaymentChannels?.map((channel, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                            >
                                                {channel}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instructions */}
                            <Card className="bg-amber-50 border-amber-200">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-amber-800">Important Instructions</h4>
                                            <p className="text-amber-700 text-sm mt-1">
                                                {invoiceData.Instructions}
                                            </p>
                                            <p className="text-amber-700 text-sm mt-2">
                                                Hold expires at: {invoiceData.BookingSummary?.HoldExpiresAt}
                                                {/* Hold expires at: {format(new Date(invoiceData.BookingSummary?.HoldExpiresAt), "PPP 'at' p")} */}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Input Fields */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-3">Payment Details</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                                            <Input
                                                id="invoiceNumber"
                                                value={paymentInputs.invoiceNumber}
                                                onChange={(e) => handlePaymentInputChange("invoiceNumber", e.target.value)}
                                                placeholder="Enter invoice number"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalPayment">Total Payment (PKR) *</Label>
                                            <Input
                                                id="totalPayment"
                                                type="number"
                                                value={paymentInputs.totalPayment}
                                                onChange={(e) => handlePaymentInputChange("totalPayment", e.target.value)}
                                                placeholder="Enter total payment amount"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handlePaymentSubmit}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Proceed to Payment
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

