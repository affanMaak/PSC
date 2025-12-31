import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, differenceInDays, addDays, isWithinInterval } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Bed, Users, AlertTriangle, Clock, CheckCircle, XCircle, Building, TreePalm, Camera, Menu, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCalendarRooms, getHalls, getLawns, getPhotoshoots } from "../../config/apis";

interface RoomBooking {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  memberName: string;
  paymentStatus: string;
  totalPrice: number;
}

interface RoomReservation {
  id: string;
  roomId: string;
  reservedFrom: string;
  reservedTo: string;
  admin: {
    name: string;
    email: string;
  };
}

interface OutOfOrder {
  id: number;
  roomId?: number;
  hallId?: number;
  lawnId?: number;
  photoshootId?: number;
  reason: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: {
    type: string;
    priceMember: string;
    priceGuest: string;
  };
  isActive: boolean;
  isOutOfOrder: boolean;
  isReserved: boolean;
  isBooked: boolean;
  bookings: RoomBooking[];
  reservations: RoomReservation[];
  outOfOrders: OutOfOrder[];
}

interface Hall {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  isOutOfOrder: boolean;
  isBooked: boolean;
  isReserved: boolean;
  bookings: any[];
  reservations: any[];
  outOfOrders: OutOfOrder[];
}

interface Lawn {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  isOutOfOrder: boolean;
  isBooked: boolean;
  isReserved: boolean;
  bookings: any[];
  reservations: any[];
  outOfOrders: OutOfOrder[];
}

interface Photoshoot {
  id: string;
  name: string;
  isActive: boolean;
  isOutOfOrder: boolean;
  isBooked: boolean;
  isReserved: boolean;
  bookings: any[];
  reservations: any[];
  outOfOrders: OutOfOrder[];
}

type FacilityType = "ROOMS" | "HALLS" | "LAWNS" | "PHOTOSHOOTS";

interface TimelinePeriod {
  id: string;
  type: 'booking' | 'reservation' | 'outOfOrder';
  startDate: Date;
  endDate: Date;
  data: any;
}

export default function FacilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityType>("ROOMS");
  const [selectedRoomType, setSelectedRoomType] = useState("ALL");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('MONTH');

  // Fetch data based on selected facility type
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["calendarRooms"],
    queryFn: getCalendarRooms,
    enabled: selectedFacilityType === "ROOMS",
  });
  console.log(rooms)

  const { data: halls = [], isLoading: hallsLoading } = useQuery<Hall[]>({
    queryKey: ["halls"],
    queryFn: getHalls,
    enabled: selectedFacilityType === "HALLS",
  });

  const { data: lawns = [], isLoading: lawnsLoading } = useQuery<Lawn[]>({
    queryKey: ["lawns"],
    queryFn: getLawns,
    enabled: selectedFacilityType === "LAWNS",
  });

  const { data: photoshoots = [], isLoading: photoshootsLoading } = useQuery<Photoshoot[]>({
    queryKey: ["photoshoots"],
    queryFn: getPhotoshoots,
    enabled: selectedFacilityType === "PHOTOSHOOTS",
  });

  const isLoading = roomsLoading || hallsLoading || lawnsLoading || photoshootsLoading;

  // Get current facility data based on selection
  const getCurrentFacilities = () => {
    switch (selectedFacilityType) {
      case "ROOMS":
        return rooms;
      case "HALLS":
        return halls;
      case "LAWNS":
        return lawns;
      case "PHOTOSHOOTS":
        return photoshoots;
      default:
        return [];
    }
  };

  // Filter rooms based on selection (only for rooms)
  const filteredRooms = rooms.filter(room => {
    const typeMatch = selectedRoomType === "ALL" || room.roomType.type === selectedRoomType;
    const roomMatch = !selectedRoom || room.id.toString() === selectedRoom;
    return typeMatch && roomMatch;
  });

  // Get facilities to display in timeline
  const getFacilitiesForTimeline = () => {
    if (selectedFacilityType === "ROOMS") {
      return filteredRooms;
    }
    return getCurrentFacilities();
  };

  // Generate date range for the timeline
  const generateDateRange = () => {
    const start = viewMode === 'MONTH' ? startOfMonth(currentDate) : startOfWeek(currentDate);
    const end = viewMode === 'MONTH' ? endOfMonth(currentDate) : endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const dateRange = generateDateRange();

  // Get periods for a facility
  const getPeriodsForFacility = (facility: any): TimelinePeriod[] => {
    const periods: TimelinePeriod[] = [];
    const timelineStart = dateRange[0];
    const timelineEnd = dateRange[dateRange.length - 1];

    // Add bookings
    if (facility.bookings && facility.bookings.length > 0) {
      facility.bookings.forEach((booking: any) => {
        if (selectedFacilityType === "ROOMS") {
          const startDate = new Date(booking.checkIn);
          const endDate = new Date(booking.checkOut);

          // Only include if period overlaps with visible range
          if (endDate >= timelineStart && startDate <= timelineEnd) {
            periods.push({
              id: `booking-${booking.id}`,
              type: 'booking',
              startDate,
              endDate,
              data: booking
            });
          }
        } else {
          // For other facilities, bookingDate represents the booking date
          const bookingDate = new Date(booking.bookingDate || booking.createdAt);

          // Only include if date is within visible range
          if (bookingDate >= timelineStart && bookingDate <= timelineEnd) {
            periods.push({
              id: `booking-${booking.id}`,
              type: 'booking',
              startDate: bookingDate,
              endDate: bookingDate,
              data: booking
            });
          }
        }
      });
    }

    // Add reservations
    if (facility.reservations && facility.reservations.length > 0) {
      facility.reservations.forEach((reservation: any) => {
        const startDate = new Date(reservation.reservedFrom);
        const endDate = new Date(reservation.reservedTo);

        // Only include if period overlaps with visible range
        if (endDate >= timelineStart && startDate <= timelineEnd) {
          periods.push({
            id: `reservation-${reservation.id}`,
            type: 'reservation',
            startDate,
            endDate,
            data: reservation
          });
        }
      });
    }

    // Add out of order periods from outOfOrders array
    if (facility.outOfOrders && facility.outOfOrders.length > 0) {
      facility.outOfOrders.forEach((outOfOrder: OutOfOrder) => {
        const startDate = new Date(outOfOrder.startDate);
        const endDate = new Date(outOfOrder.endDate);

        // Only include if period overlaps with visible range
        if (endDate >= timelineStart && startDate <= timelineEnd) {
          periods.push({
            id: `outoforder-${outOfOrder.id}`,
            type: 'outOfOrder',
            startDate,
            endDate,
            data: {
              reason: outOfOrder.reason || 'Maintenance',
              from: outOfOrder.startDate,
              to: outOfOrder.endDate
            }
          });
        }
      });
    }

    return periods;
  };

  // Calculate period bar position and width with clipping
  const calculatePeriodStyle = (period: TimelinePeriod, timelineStart: Date, timelineEnd: Date, dayWidth: number) => {
    // Clip period to visible date range
    const clippedStart = period.startDate < timelineStart ? timelineStart : period.startDate;
    const clippedEnd = period.endDate > timelineEnd ? timelineEnd : period.endDate;

    // Calculate days from timeline start
    const startOffset = differenceInDays(clippedStart, timelineStart);
    const duration = differenceInDays(clippedEnd, clippedStart) + 1;

    // Convert to pixels
    const left = Math.max(0, startOffset * dayWidth);
    const width = Math.max(dayWidth * 0.5, duration * dayWidth); // Minimum half-day width for visibility

    return {
      left: `${left}px`,
      width: `${width}px`
    };
  };

  // Get period color
  const getPeriodColor = (type: 'booking' | 'reservation' | 'outOfOrder', paymentStatus?: string) => {
    switch (type) {
      case 'booking':
        if (paymentStatus === 'PAID') return 'bg-blue-700 hover:bg-blue-800';
        if (paymentStatus === 'HALF_PAID') return 'bg-blue-500 hover:bg-blue-600';
        return 'bg-blue-300 hover:bg-blue-400'; // UNPAID or default
      case 'reservation':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'outOfOrder':
        return 'bg-red-300 hover:bg-red-400';
      default:
        return 'bg-gray-500';
    }
  };

  // Get facility display name
  const getFacilityName = (facility: any) => {
    if (selectedFacilityType === "ROOMS") {
      return `Room ${facility.roomNumber}`;
    }
    return facility.name;
  };

  // Navigation
  const nextPeriod = () => {
    if (viewMode === 'MONTH') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };
  const prevPeriod = () => {
    if (viewMode === 'MONTH') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };
  const goToToday = () => setCurrentDate(new Date());

  // Get unique room types for filter (only for rooms)
  const roomTypes = [...new Set(rooms.map(room => room.roomType.type))];

  // Get facility type icon
  const getFacilityTypeIcon = (type: FacilityType) => {
    switch (type) {
      case "ROOMS":
        return <Bed className="h-4 w-4" />;
      case "HALLS":
        return <Building className="h-4 w-4" />;
      case "LAWNS":
        return <TreePalm className="h-4 w-4" />;
      case "PHOTOSHOOTS":
        return <Camera className="h-4 w-4" />;
      default:
        return <Bed className="h-4 w-4" />;
    }
  };

  // Get facility type display name
  const getFacilityTypeName = (type: FacilityType) => {
    switch (type) {
      case "ROOMS":
        return "Rooms";
      case "HALLS":
        return "Halls";
      case "LAWNS":
        return "Lawns";
      case "PHOTOSHOOTS":
        return "Photoshoots";
      default:
        return "Rooms";
    }
  };

  // Reset room-specific filters when facility type changes
  useEffect(() => {
    setSelectedRoomType("ALL");
    setSelectedRoom(null);
  }, [selectedFacilityType]);

  const facilities = getFacilitiesForTimeline();
  const dayWidth = 80; // Width in pixels for each day column

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
            Facility Timeline Calendar
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            View bookings, reservations, and maintenance schedules across all facilities
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
              {/* Facility Type Filter */}
              <Select value={selectedFacilityType} onValueChange={(value: FacilityType) => setSelectedFacilityType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Facility Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROOMS">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      <span>Rooms</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="HALLS">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Halls</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="LAWNS">
                    <div className="flex items-center gap-2">
                      <TreePalm className="h-4 w-4" />
                      <span>Lawns</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PHOTOSHOOTS">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span>Photoshoots</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Room-specific filters (only show for rooms) */}
              {selectedFacilityType === "ROOMS" && (
                <>
                  <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Room Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Room Types</SelectItem>
                      {roomTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedRoom || "ALL"}
                    onValueChange={value => setSelectedRoom(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Rooms</SelectItem>
                      {rooms
                        .filter(room => selectedRoomType === "ALL" || room.roomType.type === selectedRoomType)
                        .map(room => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            Room {room.roomNumber} ({room.roomType.type})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* View Mode selection */}
              <Select value={viewMode} onValueChange={(value: 'MONTH' | 'WEEK') => setViewMode(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTH">Monthly</SelectItem>
                  <SelectItem value="WEEK">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-normal">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPeriod}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={nextPeriod}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-semibold min-w-[200px] text-center text-sm sm:text-base">
                {viewMode === 'MONTH' ? format(currentDate, "MMMM yyyy") : `${format(dateRange[0], "MMM d")} - ${format(dateRange[dateRange.length - 1], "MMM d, yyyy")}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center text-xs sm:text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-3 rounded bg-blue-700"></div>
                  <span>Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-3 rounded bg-blue-500"></div>
                  <span>Half-Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-3 rounded bg-blue-300"></div>
                  <span>Unpaid</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 rounded bg-yellow-500"></div>
                <span>Reservations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 rounded bg-red-300"></div>
                <span>Out of Service</span>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              {getFacilityTypeIcon(selectedFacilityType)}
              {getFacilityTypeName(selectedFacilityType)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading {getFacilityTypeName(selectedFacilityType).toLowerCase()} data...
              </div>
            </div>
          ) : facilities.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">
                No {getFacilityTypeName(selectedFacilityType).toLowerCase()} found matching the filters
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header Row - Dates */}
                <div className="flex border-b bg-muted/50 sticky top-0 z-10">
                  {/* Empty cell for facility names column */}
                  <div className="w-48 flex-shrink-0 border-r p-2 font-semibold text-sm bg-muted/80">
                    Facility
                  </div>
                  {/* Date columns */}
                  <div className="flex">
                    {dateRange.map((date, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex-shrink-0 border-r p-2 text-center text-xs font-medium items-center justify-center",
                          isSameDay(date, new Date()) && "bg-blue-50"
                        )}
                        style={{ width: `${dayWidth}px` }}
                      >
                        <div>{format(date, "MMM d")}</div>
                        <div className="text-[10px] text-muted-foreground">{format(date, "EEE")}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facility Rows */}
                <div>
                  {facilities.map((facility: any) => {
                    const periods = getPeriodsForFacility(facility);

                    return (
                      <div key={facility.id} className="flex border-b hover:bg-muted/30 transition-colors">
                        {/* Facility Name Column */}
                        <div className="w-48 flex-shrink-0 border-r p-3 font-medium text-sm flex items-center">
                          <div className="truncate">
                            {getFacilityName(facility)}
                            {selectedFacilityType === "ROOMS" && (
                              <div className="text-xs text-muted-foreground">
                                {facility.roomType.type}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline Column */}
                        <div className="relative flex-1" style={{ minHeight: '60px' }}>
                          {/* Date grid background */}
                          <div className="absolute inset-0 flex">
                            {dateRange.map((date, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "flex-shrink-0 border-r",
                                  isSameDay(date, new Date()) && "bg-blue-50/50"
                                )}
                                style={{ width: `${dayWidth}px` }}
                              />
                            ))}
                          </div>

                          {/* Period bars */}
                          <div className="absolute inset-0 flex items-center justify-center px-1 py-2">
                            <div className="relative w-full">
                              {periods.map((period) => {
                                const style = calculatePeriodStyle(period, dateRange[0], dateRange[dateRange.length - 1], dayWidth);
                                return (
                                  <TooltipProvider key={period.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={cn(
                                            "absolute h-6 rounded cursor-pointer transition-all mb-1",
                                            getPeriodColor(period.type, period.data.paymentStatus)
                                          )}
                                          style={{
                                            ...style,
                                            top: period.type === 'booking' ? '0px' :
                                              period.type === 'reservation' ? '8px' : '16px'
                                          }}
                                          onClick={() => setSelectedPeriod({ period, facility })}
                                        >
                                          <div className="text-white text-[10px] px-1 truncate leading-6">
                                            {period.type === 'booking' && (period.data.memberName || period.data.guestName)}
                                            {period.type === 'reservation' && (period.data.admin?.name || 'Reserved')}
                                            {period.type === 'outOfOrder' && 'Out of Service'}
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs text-xs">
                                        <div className="space-y-1">
                                          <div className="font-semibold capitalize">{period.type}</div>
                                          {period.type === 'booking' && (
                                            <>
                                              <div>Guest: {period.data.memberName || period.data.guestName}</div>
                                              {selectedFacilityType === "ROOMS" && (
                                                <div>
                                                  {format(period.startDate, "MMM d")} - {format(period.endDate, "MMM d, yyyy")}
                                                </div>
                                              )}
                                              {period.data.totalPrice && (
                                                <div>PKR {parseInt(period.data.totalPrice).toLocaleString()}</div>
                                              )}
                                            </>
                                          )}
                                          {period.type === 'reservation' && (
                                            <>
                                              <div>By: {period.data.admin?.name || 'Admin'}</div>
                                              <div>
                                                {format(period.startDate, "MMM d")} - {format(period.endDate, "MMM d, yyyy")}
                                              </div>
                                            </>
                                          )}
                                          {period.type === 'outOfOrder' && (
                                            <>
                                              <div>Reason: {period.data.reason}</div>
                                              <div>
                                                {format(period.startDate, "MMM d")} - {format(period.endDate, "MMM d, yyyy")}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Period Details Modal */}
      <Dialog open={!!selectedPeriod} onOpenChange={() => setSelectedPeriod(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 capitalize">
              <CalendarIcon className="h-5 w-5" />
              {selectedPeriod?.period.type} Details
            </DialogTitle>
          </DialogHeader>

          {selectedPeriod && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Facility</p>
                      <p className="text-lg font-semibold">{getFacilityName(selectedPeriod.facility)}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        selectedPeriod.period.type === 'booking' && "bg-blue-100 text-blue-800",
                        selectedPeriod.period.type === 'reservation' && "bg-yellow-100 text-yellow-800",
                        selectedPeriod.period.type === 'outOfOrder' && "bg-red-100 text-red-800"
                      )}
                    >
                      {selectedPeriod.period.type}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Period</p>
                    <p className="text-base">
                      {format(selectedPeriod.period.startDate, "MMM d, yyyy")} - {format(selectedPeriod.period.endDate, "MMM d, yyyy")}
                    </p>
                  </div>

                  {selectedPeriod.period.type === 'booking' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Guest Name</p>
                        <p className="text-base">{selectedPeriod.period.data.memberName || selectedPeriod.period.data.guestName}</p>
                      </div>
                      {selectedPeriod.period.data.totalPrice && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                          <p className="text-base font-semibold">PKR {parseInt(selectedPeriod.period.data.totalPrice).toLocaleString()}</p>
                        </div>
                      )}
                      {selectedPeriod.period.data.paymentStatus && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                          <Badge
                            variant={
                              selectedPeriod.period.data.paymentStatus === "PAID" ? "default" :
                                selectedPeriod.period.data.paymentStatus === "UNPAID" ? "destructive" : "secondary"
                            }
                            className={
                              selectedPeriod.period.data.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                                selectedPeriod.period.data.paymentStatus === "UNPAID" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {selectedPeriod.period.data.paymentStatus}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}

                  {selectedPeriod.period.type === 'reservation' && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reserved By</p>
                        <p className="text-base">{selectedPeriod.period.data.admin?.name || 'Admin'}</p>
                      </div>
                      {selectedPeriod.period.data.admin?.email && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="text-base">{selectedPeriod.period.data.admin.email}</p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedPeriod.period.type === 'outOfOrder' && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reason</p>
                      <p className="text-base">{selectedPeriod.period.data.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}