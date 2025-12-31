import { useQuery } from '@tanstack/react-query'
import { memberBookings } from '../../config/apis'
import React, { useState } from 'react'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, SearchIcon, CalendarIcon, DollarSignIcon, UserIcon, CreditCardIcon } from 'lucide-react'

// Define types for our bookings
type RoomBooking = {
  id: number
  Membership_No: string
  roomId: number
  checkIn: string
  checkOut: string
  totalPrice: string
  paymentStatus: string
  pricingType: string
  paidAmount: string
  pendingAmount: string
  numberOfAdults: number
  numberOfChildren: number
  guestName: string
  guestContact: string
  paidBy: string
  refundAmount: string
  refundReturned: boolean
}

type HallBooking = {
  id: number
  memberId: number
  hallId: number
  bookingDate: string
  totalPrice: string
  paymentStatus: string
  pricingType: string
  paidAmount: string
  pendingAmount: string
  eventType: string
  numberOfGuests: number
  bookingTime: string
  guestName: string
  guestContact: string
  paidBy: string
  refundAmount: string
}

type LawnBooking = {
  id: number
  memberId: number
  lawnId: number
  bookingDate: string
  bookingTime: string
  guestsCount: number
  totalPrice: string
  paymentStatus: string
  pricingType: string
  paidAmount: string
  pendingAmount: string
  guestName: string
  guestContact: string
  paidBy: string
  refundAmount: string
}

type PhotoshootBooking = {
  id: number
  memberId: number
  photoshootId: number
  bookingDate: string
  startTime: string
  endTime: string
  totalPrice: string
  paymentStatus: string
  pricingType: string
  paidAmount: string
  pendingAmount: string
  guestName: string
  guestContact: string
  paidBy: string
  refundAmount: string
}

type BookingType = RoomBooking | HallBooking | LawnBooking | PhotoshootBooking

// Utility function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Utility function to format currency
const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(amount))
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200'
      case 'HALF_PAID': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'UNPAID': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

// Payment info component
const PaymentInfo = ({ paid, pending, total }: { paid: string; pending: string; total: string }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Paid:</span>
      <span className="font-medium text-green-600">{formatCurrency(paid)}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Pending:</span>
      <span className="font-medium text-red-600">{formatCurrency(pending)}</span>
    </div>
    <div className="flex items-center justify-between pt-1 border-t">
      <span className="text-sm font-medium text-gray-700">Total:</span>
      <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
    </div>
  </div>
)

// Booking card component
const BookingCard = ({ booking, type }: { booking: BookingType; type: string }) => {
  const isRoomBooking = 'roomId' in booking
  const isHallBooking = 'hallId' in booking
  const isLawnBooking = 'lawnId' in booking
  const isPhotoshootBooking = 'photoshootId' in booking

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Booking #{booking.id}
            </h3>
            <StatusBadge status={booking.paymentStatus} />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {isRoomBooking && (
              <>
                <span>Room #{booking.roomId}</span>
                <span>•</span>
                <span>{booking.numberOfAdults} Adult(s), {booking.numberOfChildren} Child(ren)</span>
              </>
            )}
            {isHallBooking && (
              <>
                <span>Hall #{booking.hallId}</span>
                <span>•</span>
                <span className="capitalize">{booking.eventType}</span>
                <span>•</span>
                <span>{booking.numberOfGuests} Guests</span>
              </>
            )}
            {isLawnBooking && (
              <>
                <span>Lawn #{booking.lawnId}</span>
                <span>•</span>
                <span>{booking.guestsCount} Guests</span>
                <span>•</span>
                <span className="capitalize">{booking.bookingTime}</span>
              </>
            )}
            {isPhotoshootBooking && (
              <>
                <span>Photoshoot #{booking.photoshootId}</span>
                <span>•</span>
                <span>{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(booking.totalPrice)}
          </div>
          <div className="text-sm text-gray-500">
            {booking.pricingType === 'member' ? 'Member Rate' : 'Guest Rate'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span className="font-medium">Dates</span>
          </div>
          {isRoomBooking ? (
            <div className="text-sm">
              <div>Check-in: {formatDate(booking.checkIn)}</div>
              <div>Check-out: {formatDate(booking.checkOut)}</div>
            </div>
          ) : (
            <div className="text-sm">
              {formatDate(booking.bookingDate)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSignIcon className="w-4 h-4" />
            <span className="font-medium">Payment</span>
          </div>
          <PaymentInfo
            paid={booking.paidAmount}
            pending={booking.pendingAmount}
            total={booking.totalPrice}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4" />
            <span className="font-medium">Billing</span>
          </div>
          <div className="text-sm">
            <div>Paid by: <span className="font-medium">{booking.paidBy}</span></div>
            {booking.guestName && (
              <div>Guest: {booking.guestName}</div>
            )}
            {booking.refundAmount && Number(booking.refundAmount) > 0 && (
              <div className="text-red-600 font-medium">
                Refund: {formatCurrency(booking.refundAmount)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Created: {formatDate((booking as any).createdAt)}
        </div>
        <div className="flex items-center gap-2">
          {booking.paymentStatus === 'UNPAID' && (
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Collect Payment
            </button>
          )}
          {booking.paymentStatus === 'HALF_PAID' && (
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
              Complete Payment
            </button>
          )}
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// Empty state component
const EmptyState = ({ type }: { type: string }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
      <CalendarIcon className="w-full h-full" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No {type.toLowerCase()} bookings found</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      No bookings have been made for this membership number in the {type.toLowerCase()} category.
    </p>
  </div>
)

function Bookings() {
  const [bookingType, setBookingType] = useState<"Room" | "Hall" | "Lawn" | "Photoshoot">("Room")
  const [membershipNo, setMembershipNo] = useState(null)

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["bookings-member", bookingType, membershipNo],
    queryFn: () => memberBookings(bookingType, membershipNo)
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">View and manage all bookings across different categories</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
            <div className="flex-1">
              <label htmlFor="membershipNo" className="block text-sm font-medium text-gray-700 mb-2">
                Membership Number
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="membershipNo"
                  type="text"
                  value={membershipNo}
                  onChange={(e) => setMembershipNo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter membership number"
                />
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="bookingType" className="block text-sm font-medium text-gray-700 mb-2">
                Booking Type
              </label>
              <Select.Root value={bookingType} onValueChange={(value: any) => setBookingType(value)}>
                <Select.Trigger className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                  <Select.Value />
                  <Select.Icon>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                    <Select.Viewport>
                      <Select.Item value="Room" className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer outline-none">
                        <Select.ItemText>Room Bookings</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="Hall" className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer outline-none">
                        <Select.ItemText>Hall Bookings</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="Lawn" className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer outline-none">
                        <Select.ItemText>Lawn Bookings</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="Photoshoot" className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer outline-none">
                        <Select.ItemText>Photoshoot Bookings</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Search Bookings
              </button>
            </div>
          </form>
        </div>

        {/* Stats Summary */}
        {data.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Total Bookings</div>
              <div className="text-2xl font-bold text-gray-900">{data.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.reduce((sum: number, booking: any) => sum + Number(booking.totalPrice), 0).toString())}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Pending Amount</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.reduce((sum: number, booking: any) => sum + Number(booking.pendingAmount), 0).toString())}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Paid Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.reduce((sum: number, booking: any) => sum + Number(booking.paidAmount), 0).toString())}
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          ) : data.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {bookingType} Bookings ({data.length})
                </h2>
                <div className="text-sm text-gray-500">
                  For Membership #{membershipNo}
                </div>
              </div>
              {data.map((booking: any) => (
                <BookingCard key={booking.id} booking={booking} type={bookingType} />
              ))}
            </>
          ) : (
            <EmptyState type={bookingType} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Bookings