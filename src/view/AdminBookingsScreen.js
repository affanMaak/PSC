import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Alert,
    StatusBar,
    SafeAreaView,
    TextInput,
    Modal,
    Dimensions,
    RefreshControl,
    ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function AdminBookingsScreen({ navigation }) {
    const { user } = useAuth();
    const userRole = user?.role;

    const getRoleDisplayName = () => {
        switch (userRole) {
            case 'SUPER_ADMIN':
            case 'ADMIN':
                return 'Admin';
            case 'MEMBER':
                return 'Member';
            default:
                return 'Guest';
        }
    };

    const isAdminUser = () => {
        return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    };
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedType, setSelectedType] = useState('Room');
    const [membershipNo, setMembershipNo] = useState('');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        paidAmount: 0
    });
    const [selectedStatus, setSelectedStatus] = useState('All');

    const bookingTypes = ['Room', 'Hall', 'Lawn', 'Photoshoot'];

    useEffect(() => {
        // Load recent bookings or show empty state
        filterBookings();
    }, [bookings, selectedType, membershipNo, selectedStatus]);

    const handleSearch = async () => {
        if (!membershipNo.trim()) {
            Alert.alert('Error', 'Please enter a membership number');
            return;
        }

        try {
            setLoading(true);
            console.log(`🔍 Searching ${selectedType} bookings for member: ${membershipNo}`);

            const bookingsData = await bookingService.getMemberBookingsAdmin(selectedType, membershipNo);
            console.log('📊 Bookings data received:', bookingsData);

            if (Array.isArray(bookingsData)) {
                // Add booking type to each booking
                const typedBookings = bookingsData.map(booking => ({
                    ...booking,
                    bookingType: selectedType
                }));
                setBookings(typedBookings);
                calculateStats(typedBookings);
            } else {
                setBookings([]);
                calculateStats([]);
                Alert.alert('Info', 'No bookings found for this member');
            }

        } catch (error) {
            console.error('❌ Search error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to search bookings. Please try again.'
            );
            setBookings([]);
            calculateStats([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calculateStats = (bookingList) => {
        const stats = {
            totalBookings: bookingList.length,
            totalRevenue: 0,
            pendingAmount: 0,
            paidAmount: 0
        };

        bookingList.forEach(booking => {
            const total = parseFloat(booking.totalPrice || booking.amount || 0) || 0;
            const paid = parseFloat(booking.paidAmount || booking.paid || 0) || 0;
            const pending = parseFloat(booking.pendingAmount || booking.pending || 0) || 0;

            stats.totalRevenue += total;
            stats.paidAmount += paid;
            stats.pendingAmount += pending;
        });

        setStats(stats);
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by member search
        if (membershipNo.trim()) {
            const query = membershipNo.toLowerCase();
            filtered = filtered.filter(booking => {
                const membershipQuery = query;
                const field1 = (booking.Membership_No || '').toString().toLowerCase();
                const field2 = (booking.membership_no || '').toString().toLowerCase();
                const field3 = (booking.membershipNo || '').toString().toLowerCase();
                const field4 = (booking.memberId || '').toString().toLowerCase();
                const field5 = (booking.membership_number || '').toString().toLowerCase();

                return field1.includes(membershipQuery) ||
                    field2.includes(membershipQuery) ||
                    field3.includes(membershipQuery) ||
                    field4.includes(membershipQuery) ||
                    field5.includes(membershipQuery) ||
                    booking.bookingType;
            });
        }

        // Filter by status (New!)
        if (selectedStatus !== 'All') {
            filtered = filtered.filter(booking => {
                const status = (booking.paymentStatus || booking.status || '').toUpperCase();
                if (selectedStatus === 'Paid') return status === 'PAID' || status === 'COMPLETED' || status === 'CONFIRMED';
                if (selectedStatus === 'Pending') return status === 'PENDING' || status === 'HALF_PAID' || status === 'PARTIAL';
                if (selectedStatus === 'Unpaid') return status === 'UNPAID';
                return true;
            });
        }

        setFilteredBookings(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        if (membershipNo) {
            handleSearch();
        } else {
            setRefreshing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'PKR 0';
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return 'PKR 0';
        return `PKR ${numAmount.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    const getStatusColor = (status) => {
        if (!status) return '#6c757d';
        const statusUpper = status.toUpperCase();
        switch (statusUpper) {
            case 'PAID':
            case 'COMPLETED':
            case 'CONFIRMED':
                return '#28a745';
            case 'PENDING':
            case 'HALF_PAID':
            case 'PARTIAL':
                return '#ffc107';
            case 'UNPAID':
            case 'CANCELLED':
            case 'REJECTED':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const getStatusText = (status) => {
        if (!status) return 'Unknown';
        return status.replace('_', ' ');
    };

    const handleCollectPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid payment amount');
            return;
        }

        try {
            setLoading(true);
            await bookingService.collectPayment(
                selectedBooking.id || selectedBooking.bookingId,
                parseFloat(paymentAmount)
            );

            Alert.alert('Success', 'Payment collected successfully');
            setShowPaymentModal(false);
            setPaymentAmount('');
            handleSearch(); // Refresh the list

        } catch (error) {
            console.error('Payment collection error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to collect payment');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRefund = async () => {
        if (!refundAmount || parseFloat(refundAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid refund amount');
            return;
        }

        if (!refundReason.trim()) {
            Alert.alert('Error', 'Please enter a refund reason');
            return;
        }

        try {
            setLoading(true);
            await bookingService.processRefund(
                selectedBooking.id || selectedBooking.bookingId,
                parseFloat(refundAmount),
                refundReason
            );

            Alert.alert('Success', 'Refund processed successfully');
            setShowRefundModal(false);
            setRefundAmount('');
            setRefundReason('');
            handleSearch(); // Refresh the list

        } catch (error) {
            console.error('Refund processing error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to process refund');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (booking, newStatus) => {
        try {
            setLoading(true);
            await bookingService.updateBookingStatus(
                booking.id || booking.bookingId,
                newStatus
            );

            Alert.alert('Success', `Booking marked as ${newStatus}`);
            handleSearch(); // Refresh the list

        } catch (error) {
            console.error('Status update error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const renderBookingCard = ({ item }) => {
        const isRoomBooking = item.bookingType === 'Room' || item.roomId !== undefined;
        const isHallBooking = item.bookingType === 'Hall' || item.hallId !== undefined;
        const isLawnBooking = item.bookingType === 'Lawn' || item.lawnId !== undefined;
        const isPhotoshootBooking = item.bookingType === 'Photoshoot' || item.photoshootId !== undefined;

        const statusColor = getStatusColor(item.paymentStatus);

        return (
            <View style={styles.bookingCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.bookingId}>Booking #{item.id || item.bookingId}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {getStatusText(item.paymentStatus)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.totalPrice}>{formatCurrency(item.totalPrice || item.amount)}</Text>
                        <Text style={styles.pricingType}>
                            {item.pricingType === 'member' || item.pricing_type === 'member' ? 'Member Rate' : 'Guest Rate'}
                        </Text>
                    </View>
                </View>

                {/* Booking Details */}
                <View style={styles.bookingDetails}>
                    <View style={styles.detailsRow}>
                        {isRoomBooking && (
                            <>
                                <View style={styles.detailItem}>
                                    <Icon name="meeting-room" size={14} color="#666" />
                                    <Text style={styles.detailText}>Room #{item.roomId || item.roomNumber}</Text>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.detailItem}>
                                    <Icon name="people" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {item.numberOfAdults || 0} Adult(s), {item.numberOfChildren || 0} Child(ren)
                                    </Text>
                                </View>
                            </>
                        )}

                        {isHallBooking && (
                            <>
                                <View style={styles.detailItem}>
                                    <Icon name="meeting-room" size={14} color="#666" />
                                    <Text style={styles.detailText}>Hall #{item.hallId || item.id}</Text>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.detailItem}>
                                    <Icon name="event" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {item.eventType || 'Event'} • {item.numberOfGuests || item.guestsCount || 0} Guests
                                    </Text>
                                </View>
                            </>
                        )}

                        {isLawnBooking && (
                            <>
                                <View style={styles.detailItem}>
                                    <Icon name="grass" size={14} color="#666" />
                                    <Text style={styles.detailText}>Lawn #{item.lawnId || item.id}</Text>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.detailItem}>
                                    <Icon name="people" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {item.guestsCount || item.numberOfGuests || 0} Guests • {item.bookingTime || item.time_slot || ''}
                                    </Text>
                                </View>
                            </>
                        )}

                        {isPhotoshootBooking && (
                            <>
                                <View style={styles.detailItem}>
                                    <Icon name="camera-alt" size={14} color="#666" />
                                    <Text style={styles.detailText}>Photoshoot #{item.photoshootId || item.id}</Text>
                                </View>
                                <View style={styles.separator} />
                                <View style={styles.detailItem}>
                                    <Icon name="schedule" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {formatDate(item.startTime || item.start_time)} - {formatDate(item.endTime || item.end_time)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Grid Sections */}
                <View style={styles.gridContainer}>
                    {/* Dates */}
                    <View style={styles.gridSection}>
                        <View style={styles.sectionHeader}>
                            <Icon name="calendar-today" size={16} color="#666" />
                            <Text style={styles.sectionTitle}>Dates</Text>
                        </View>
                        {isRoomBooking ? (
                            <View style={styles.dateSection}>
                                <Text style={styles.dateLabel}>Check-in:</Text>
                                <Text style={styles.dateValue}>{formatDate(item.checkIn || item.bookingDate)}</Text>
                                <Text style={styles.dateLabel}>Check-out:</Text>
                                <Text style={styles.dateValue}>{formatDate(item.checkOut || item.booking_date)}</Text>
                            </View>
                        ) : (
                            <Text style={styles.dateValue}>{formatDate(item.bookingDate || item.date || item.startTime)}</Text>
                        )}
                    </View>

                    {/* Payment */}
                    <View style={styles.gridSection}>
                        <View style={styles.sectionHeader}>
                            <Icon name="attach-money" size={16} color="#666" />
                            <Text style={styles.sectionTitle}>Payment</Text>
                        </View>
                        <View style={styles.paymentInfo}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Paid:</Text>
                                <Text style={[styles.paymentValue, { color: '#28a745' }]}>
                                    {formatCurrency(item.paidAmount || item.paid)}
                                </Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Pending:</Text>
                                <Text style={[styles.paymentValue, { color: '#dc3545' }]}>
                                    {formatCurrency(item.pendingAmount || item.pending)}
                                </Text>
                            </View>
                            <View style={[styles.paymentRow, styles.totalRow]}>
                                <Text style={styles.paymentLabel}>Total:</Text>
                                <Text style={styles.totalValue}>{formatCurrency(item.totalPrice || item.amount)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Billing */}
                    <View style={styles.gridSection}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={16} color="#666" />
                            <Text style={styles.sectionTitle}>Billing</Text>
                        </View>
                        <View style={styles.billingInfo}>
                            <View style={styles.billingRow}>
                                <Text style={styles.billingLabel}>Paid by:</Text>
                                <Text style={styles.billingValue}>{item.paidBy || 'MEMBER'}</Text>
                            </View>
                            {item.guestName && (
                                <View style={styles.billingRow}>
                                    <Text style={styles.billingLabel}>Guest:</Text>
                                    <Text style={styles.billingValue}>{item.guestName}</Text>
                                </View>
                            )}
                            {item.refundAmount && parseFloat(item.refundAmount) > 0 && (
                                <View style={styles.refundRow}>
                                    <Text style={styles.refundLabel}>Refund:</Text>
                                    <Text style={styles.refundValue}>
                                        {formatCurrency(item.refundAmount)}
                                        {item.refundReturned && ' ✓ Returned'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.createdDate}>
                        Created: {formatDate(item.createdAt)}
                    </Text>
                    <View style={styles.actionButtons}>
                        {item.paymentStatus === 'UNPAID' && (
                            <TouchableOpacity
                                style={styles.collectButton}
                                onPress={() => {
                                    setSelectedBooking(item);
                                    setPaymentAmount(item.pendingAmount || item.totalPrice);
                                    setShowPaymentModal(true);
                                }}
                            >
                                <Icon name="payment" size={16} color="#fff" />
                                <Text style={styles.collectButtonText}>Collect Payment</Text>
                            </TouchableOpacity>
                        )}

                        {item.paymentStatus === 'HALF_PAID' && (
                            <TouchableOpacity
                                style={styles.completeButton}
                                onPress={() => {
                                    setSelectedBooking(item);
                                    setPaymentAmount(item.pendingAmount);
                                    setShowPaymentModal(true);
                                }}
                            >
                                <Icon name="check-circle" size={16} color="#fff" />
                                <Text style={styles.completeButtonText}>Complete Payment</Text>
                            </TouchableOpacity>
                        )}

                        {item.paymentStatus === 'PAID' && parseFloat(item.refundAmount || 0) === 0 && (
                            <TouchableOpacity
                                style={styles.refundButton}
                                onPress={() => {
                                    setSelectedBooking(item);
                                    setRefundAmount('');
                                    setRefundReason('');
                                    setShowRefundModal(true);
                                }}
                            >
                                <Icon name="currency-exchange" size={16} color="#fff" />
                                <Text style={styles.refundButtonText}>Refund</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() => navigation.navigate('BookingDetailsScreen', { booking: item })}
                        >
                            <Text style={styles.detailsButtonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="search-off" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptyText}>
                {membershipNo
                    ? `No ${selectedType.toLowerCase()} bookings found for membership #${membershipNo}`
                    : 'Enter a membership number to search bookings'
                }
            </Text>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalBookings}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#dc3545' }]}>
                    {formatCurrency(stats.pendingAmount)}
                </Text>
                <Text style={styles.statLabel}>Pending Amount</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#28a745' }]}>
                    {formatCurrency(stats.paidAmount)}
                </Text>
                <Text style={styles.statLabel}>Paid Amount</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />

            {/* Image-based Notch Header (copied from Home.js) */}
            <ImageBackground
                source={require('../../assets/notch.jpg')}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={28} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Booking Management</Text>
                        {userRole ? (
                            <View style={styles.roleContainer}>
                                <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
                                {isAdminUser() && (
                                    <Icon name="verified" size={12} color="#4CAF50" style={styles.adminBadge} />
                                )}
                            </View>
                        ) : (
                            <Text style={styles.noRole}>Not Logged In</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={onRefresh}
                        activeOpacity={0.7}
                        disabled={loading || refreshing}
                    >
                        {(loading || refreshing) ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Icon name="refresh" size={24} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#b48a64']}
                    />
                }
            >
                {/* Page Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        View and manage all bookings across different categories
                    </Text>
                </View>

                {/* Search Controls */}
                <View style={styles.controlsCard}>
                    <View style={styles.formContainer}>
                        {/* Membership Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Membership Number</Text>
                            <View style={styles.searchInputContainer}>
                                <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Enter membership number"
                                    value={membershipNo}
                                    onChangeText={setMembershipNo}
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Booking Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Booking Type</Text>
                            <TouchableOpacity
                                style={styles.typeSelector}
                                onPress={() => setShowTypeDropdown(true)}
                            >
                                <Text style={styles.typeSelectorText}>{selectedType} Bookings</Text>
                                <Icon name="expand-more" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Button */}
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={handleSearch}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.searchButtonText}>Search Bookings</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Filter Bar */}
                <View style={styles.statusFilterBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsContent}>
                        {['All', 'Paid', 'Pending', 'Unpaid'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusTab,
                                    selectedStatus === status && styles.statusTabActive
                                ]}
                                onPress={() => setSelectedStatus(status)}
                            >
                                <View style={[
                                    styles.statusTabDot,
                                    { backgroundColor: status === 'All' ? '#666' : getStatusColor(status.toUpperCase()) }
                                ]} />
                                <Text style={[
                                    styles.statusTabText,
                                    selectedStatus === status && styles.statusTabTextActive
                                ]}>
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Stats Summary */}
                {bookings.length > 0 && renderStats()}

                {/* Bookings List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#b48a64" />
                        <Text style={styles.loadingText}>Loading bookings...</Text>
                    </View>
                ) : (
                    <View style={styles.bookingsList}>
                        {bookings.length > 0 ? (
                            <>
                                <View style={styles.resultsHeader}>
                                    <Text style={styles.resultsTitle}>
                                        {selectedType} Bookings ({filteredBookings.length})
                                    </Text>
                                    <Text style={styles.resultsSubtitle}>
                                        For Membership #{membershipNo}
                                    </Text>
                                </View>
                                <FlatList
                                    data={filteredBookings}
                                    renderItem={renderBookingCard}
                                    keyExtractor={(item) => (item.id || item.bookingId).toString()}
                                    scrollEnabled={false}
                                    showsVerticalScrollIndicator={false}
                                    ItemSeparatorComponent={() => <View style={styles.separatorLine} />}
                                />
                            </>
                        ) : (
                            renderEmptyState()
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Type Dropdown Modal */}
            <Modal
                visible={showTypeDropdown}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowTypeDropdown(false)}
            >
                <View style={styles.dropdownOverlay}>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Select Booking Type</Text>
                            <TouchableOpacity onPress={() => setShowTypeDropdown(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.dropdownContent}>
                            {bookingTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.dropdownItem,
                                        selectedType === type && styles.dropdownItemActive
                                    ]}
                                    onPress={() => {
                                        setSelectedType(type);
                                        setShowTypeDropdown(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedType === type && styles.dropdownItemTextActive
                                    ]}>
                                        {type} Bookings
                                    </Text>
                                    {selectedType === type && (
                                        <Icon name="check" size={20} color="#b48a64" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Collect Payment Modal */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="payment" size={24} color="#b48a64" />
                            <Text style={styles.modalTitle}>Collect Payment</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {selectedBooking && (
                                <View style={styles.bookingInfoModal}>
                                    <Text style={styles.modalBookingId}>
                                        Booking #{selectedBooking.id || selectedBooking.bookingId}
                                    </Text>
                                    <Text style={styles.modalBookingType}>
                                        {selectedType} Booking • {formatCurrency(selectedBooking.totalPrice)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.inputGroupModal}>
                                <Text style={styles.inputLabelModal}>Amount to Collect (PKR)</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="Enter amount"
                                    value={paymentAmount}
                                    onChangeText={setPaymentAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                                <Text style={styles.helperText}>
                                    Pending amount: {formatCurrency(selectedBooking?.pendingAmount || 0)}
                                </Text>
                            </View>

                            <View style={styles.paymentMethods}>
                                <Text style={styles.paymentMethodsTitle}>Payment Method</Text>
                                <View style={styles.methodsGrid}>
                                    {['CASH', 'CARD', 'TRANSFER', 'OTHER'].map((method) => (
                                        <TouchableOpacity key={method} style={styles.methodButton}>
                                            <Text style={styles.methodButtonText}>{method}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelModalButton}
                                onPress={() => setShowPaymentModal(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmModalButton}
                                onPress={handleCollectPayment}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmModalButtonText}>Collect Payment</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Refund Modal */}
            <Modal
                visible={showRefundModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowRefundModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="currency-exchange" size={24} color="#dc3545" />
                            <Text style={styles.modalTitle}>Process Refund</Text>
                            <TouchableOpacity onPress={() => setShowRefundModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {selectedBooking && (
                                <View style={styles.bookingInfoModal}>
                                    <Text style={styles.modalBookingId}>
                                        Booking #{selectedBooking.id || selectedBooking.bookingId}
                                    </Text>
                                    <Text style={styles.modalBookingType}>
                                        {selectedType} Booking • Paid: {formatCurrency(selectedBooking.paidAmount)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.inputGroupModal}>
                                <Text style={styles.inputLabelModal}>Refund Amount (PKR)</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="Enter refund amount"
                                    value={refundAmount}
                                    onChangeText={setRefundAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroupModal}>
                                <Text style={styles.inputLabelModal}>Refund Reason</Text>
                                <TextInput
                                    style={styles.reasonInput}
                                    placeholder="Enter reason for refund"
                                    value={refundReason}
                                    onChangeText={setRefundReason}
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.refundWarning}>
                                <Icon name="warning" size={20} color="#ffc107" />
                                <Text style={styles.refundWarningText}>
                                    Refunds will be processed immediately. This action cannot be undone.
                                </Text>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelModalButton}
                                onPress={() => setShowRefundModal(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmModalButton, styles.refundConfirmButton]}
                                onPress={handleProcessRefund}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmModalButtonText}>Process Refund</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f3eb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 80,
        marginBottom: 10,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6c757d',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4a3728',
        letterSpacing: 0.5,
    },
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
        minHeight: 140,
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userRole: {
        color: "black",
        fontSize: 12,
        marginLeft: 4,
    },
    adminBadge: {
        marginLeft: 6,
    },
    noRole: {
        color: "#ff6b6b",
        fontSize: 12,
        fontStyle: 'italic',
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    descriptionContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 22,
    },
    controlsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 4,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#212529',
    },
    typeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    typeSelectorText: {
        fontSize: 16,
        color: '#212529',
        fontWeight: '500',
    },
    searchButton: {
        backgroundColor: '#007bff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: width / 2.3,
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 12,
        color: '#6c757d',
        fontWeight: '500',
    },
    loadingContainer: {
        paddingVertical: 50,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#6c757d',
        fontSize: 16,
    },
    bookingsList: {
        paddingHorizontal: 20,
        marginTop: 20,
        paddingBottom: 40,
    },
    resultsHeader: {
        marginBottom: 20,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    resultsSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    separatorLine: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginVertical: 16,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    bookingId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    totalPrice: {
        fontSize: 22,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    pricingType: {
        fontSize: 12,
        color: '#6c757d',
    },
    bookingDetails: {
        marginBottom: 20,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    detailText: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 6,
    },
    separator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#adb5bd',
        marginRight: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 16,
    },
    gridSection: {
        flex: 1,
        minWidth: width / 3.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginLeft: 6,
    },
    dateSection: {
        gap: 4,
    },
    dateLabel: {
        fontSize: 12,
        color: '#6c757d',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212529',
    },
    paymentInfo: {
        gap: 6,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentLabel: {
        fontSize: 12,
        color: '#6c757d',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        marginTop: 4,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#212529',
    },
    billingInfo: {
        gap: 6,
    },
    billingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    billingLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginRight: 6,
    },
    billingValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212529',
        flex: 1,
    },
    refundRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    refundLabel: {
        fontSize: 12,
        color: '#dc3545',
        marginRight: 6,
        fontWeight: '600',
    },
    refundValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#dc3545',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    createdDate: {
        fontSize: 12,
        color: '#adb5bd',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    collectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    collectButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    refundButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc3545',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    refundButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    detailsButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#6c757d',
    },
    detailsButtonText: {
        color: '#6c757d',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 24,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '50%',
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    dropdownContent: {
        padding: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 8,
        marginBottom: 5,
    },
    dropdownItemActive: {
        backgroundColor: '#f8f9fa',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#212529',
    },
    dropdownItemTextActive: {
        color: '#b48a64',
        fontWeight: '700',
    },
    statusFilterBar: {
        marginTop: 20,
        marginBottom: 10,
    },
    statusTabsContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    statusTab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statusTabActive: {
        backgroundColor: '#4a3728',
        borderColor: '#4a3728',
    },
    statusTabDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
    },
    statusTabTextActive: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        textAlign: 'center',
        marginLeft: 10,
    },
    modalContent: {
        padding: 20,
    },
    bookingInfoModal: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalBookingId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 4,
    },
    modalBookingType: {
        fontSize: 14,
        color: '#6c757d',
    },
    inputGroupModal: {
        marginBottom: 20,
    },
    inputLabelModal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    amountInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#212529',
    },
    helperText: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 6,
    },
    paymentMethods: {
        marginBottom: 20,
    },
    paymentMethodsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 10,
    },
    methodsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    methodButton: {
        flex: 1,
        minWidth: '22%',
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#dee2e6',
        alignItems: 'center',
    },
    methodButtonText: {
        fontSize: 12,
        color: '#495057',
        fontWeight: '500',
    },
    reasonInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#212529',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    refundWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
        marginTop: 10,
    },
    refundWarningText: {
        flex: 1,
        fontSize: 13,
        color: '#856404',
        marginLeft: 10,
        lineHeight: 18,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    cancelModalButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    cancelModalButtonText: {
        fontSize: 16,
        color: '#6c757d',
        fontWeight: '600',
    },
    confirmModalButton: {
        flex: 1,
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    refundConfirmButton: {
        backgroundColor: '#dc3545',
    },
    confirmModalButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});