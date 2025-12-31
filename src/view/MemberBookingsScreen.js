
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
    RefreshControl,
    SafeAreaView,
    Modal,
    TextInput,
    Dimensions,
    ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function MemberBookingsScreen({ navigation }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedType, setSelectedType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalAmount: 0,
        pendingAmount: 0,
        paidAmount: 0
    });

    const bookingTypes = ['Room', 'Hall', 'Lawn', 'Photoshoot'];
    const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [selectedType, searchQuery, bookings]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            console.log('📋 Fetching bookings for membership:', membershipNo);

            if (!membershipNo) {
                Alert.alert('Error', 'Membership number not found. Please login again.');
                navigation.goBack();
                return;
            }

            let bookingsData;

            // If selectedType is 'All', get all bookings
            if (selectedType === 'All') {
                bookingsData = await bookingService.getMemberBookings(membershipNo);
            } else {
                // Get specific type bookings
                bookingsData = await bookingService.getMemberBookingsByType(selectedType, membershipNo);
            }

            console.log('📊 Raw bookings data received:', bookingsData);

            // Process the response based on different formats
            const processedBookings = processBookingsResponse(bookingsData, selectedType);
            console.log('✅ Processed bookings:', processedBookings.length);

            setBookings(processedBookings);
            calculateStats(processedBookings);

        } catch (error) {
            console.error('❌ Error fetching bookings:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to load bookings. Please try again.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Helper function to process different API response formats
    const processBookingsResponse = (data, type) => {
        let allBookings = [];

        // Format 1: Direct array
        if (Array.isArray(data)) {
            allBookings = data.map(booking => ({
                ...booking,
                bookingType: type === 'All' ? getBookingTypeFromData(booking) : type
            }));
        }
        // Format 2: Object with 'bookings' array
        else if (data.bookings && Array.isArray(data.bookings)) {
            allBookings = data.bookings.map(booking => ({
                ...booking,
                bookingType: type === 'All' ? getBookingTypeFromData(booking) : type
            }));
        }
        // Format 3: Object with 'data' array
        else if (data.data && Array.isArray(data.data)) {
            allBookings = data.data.map(booking => ({
                ...booking,
                bookingType: type === 'All' ? getBookingTypeFromData(booking) : type
            }));
        }
        // Format 4: Object with separate arrays for each type (like your web portal)
        else if (data.Room || data.Hall || data.Lawn || data.Photoshoot) {
            if (type === 'All') {
                // Combine all types
                allBookings = [
                    ...(data.Room || []).map(b => ({ ...b, bookingType: 'Room' })),
                    ...(data.Hall || []).map(b => ({ ...b, bookingType: 'Hall' })),
                    ...(data.Lawn || []).map(b => ({ ...b, bookingType: 'Lawn' })),
                    ...(data.Photoshoot || []).map(b => ({ ...b, bookingType: 'Photoshoot' }))
                ];
            } else {
                // Get specific type
                const typeKey = type.charAt(0).toUpperCase() + type.slice(1);
                allBookings = (data[typeKey] || []).map(b => ({
                    ...b,
                    bookingType: type
                }));
            }
        }
        // Format 5: Single object
        else if (data && typeof data === 'object') {
            allBookings = [{ ...data, bookingType: type }];
        }

        // Ensure all bookings have required fields
        return allBookings.map(booking => ({
            id: booking.id || booking.bookingId || Math.random().toString(),
            bookingId: booking.bookingId || booking.id,
            roomNumber: booking.roomNumber || booking.roomId || booking.room_no,
            checkIn: booking.checkIn || booking.from || booking.bookingDate,
            checkOut: booking.checkOut || booking.to || booking.endDate,
            totalPrice: booking.totalPrice || booking.amount || booking.price,
            paidAmount: booking.paidAmount || booking.paid,
            pendingAmount: booking.pendingAmount || booking.pending,
            paymentStatus: booking.paymentStatus || booking.status,
            guestName: booking.guestName,
            guestContact: booking.guestContact,
            numberOfAdults: booking.numberOfAdults || booking.adults,
            numberOfChildren: booking.numberOfChildren || booking.children,
            pricingType: booking.pricingType,
            bookingType: booking.bookingType,
            createdAt: booking.createdAt || booking.created_date,
            specialRequest: booking.specialRequest,
            remarks: booking.remarks
        }));
    };

    // Helper to determine booking type from data
    const getBookingTypeFromData = (booking) => {
        if (booking.roomId || booking.roomNumber) return 'Room';
        if (booking.hallId) return 'Hall';
        if (booking.lawnId) return 'Lawn';
        if (booking.photoshootId) return 'Photoshoot';
        return 'Unknown';
    };

    const calculateStats = (bookingList) => {
        const stats = {
            totalBookings: bookingList.length,
            totalAmount: 0,
            pendingAmount: 0,
            paidAmount: 0
        };

        bookingList.forEach(booking => {
            const total = parseFloat(booking.totalPrice || booking.amount || 0) || 0;
            const paid = parseFloat(booking.paidAmount || booking.paid || 0) || 0;
            const pending = parseFloat(booking.pendingAmount || booking.pending || 0) || 0;

            stats.totalAmount += total;
            stats.paidAmount += paid;
            stats.pendingAmount += pending;
        });

        setStats(stats);
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by type (if not 'All')
        if (selectedType !== 'All') {
            filtered = filtered.filter(booking =>
                booking.bookingType === selectedType
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(booking =>
                (booking.id && booking.id.toString().toLowerCase().includes(query)) ||
                (booking.bookingId && booking.bookingId.toString().toLowerCase().includes(query)) ||
                (booking.guestName && booking.guestName.toLowerCase().includes(query)) ||
                (booking.roomNumber && booking.roomNumber.toString().includes(query))
            );
        }

        setFilteredBookings(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleTypeChange = async (type) => {
        setSelectedType(type);
        setLoading(true);
        try {
            let bookingsData;
            if (type === 'All') {
                bookingsData = await bookingService.getMemberBookings(membershipNo);
            } else {
                bookingsData = await bookingService.getMemberBookingsByType(type, membershipNo);
            }

            const processedBookings = processBookingsResponse(bookingsData, type);
            setBookings(processedBookings);
            calculateStats(processedBookings);
        } catch (error) {
            console.error('Error changing type:', error);
            Alert.alert('Error', 'Failed to load bookings for this type.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
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
        if (!amount && amount !== 0) return '0 Rs';
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return '0 Rs';
        return `${numAmount.toFixed(0)} Rs`;
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

    const renderBookingCard = ({ item }) => {
        const statusColor = getStatusColor(item.paymentStatus);

        return (
            <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => navigation.navigate('BookingDetailsScreen', { booking: item })}
            >
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingTypeBadge}>
                        <Icon name="receipt" size={14} color="#1565c0" />
                        <Text style={styles.bookingTypeText}>
                            {item.bookingType || 'Booking'} #{item.bookingId || item.id}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusText(item.paymentStatus)}
                        </Text>
                    </View>
                </View>

                <View style={styles.bookingInfo}>
                    {item.roomNumber && (
                        <View style={styles.roomInfo}>
                            <Icon name="meeting-room" size={16} color="#666" />
                            <Text style={styles.roomText}>Room {item.roomNumber}</Text>
                        </View>
                    )}

                    <View style={styles.datesContainer}>
                        <View style={styles.dateItem}>
                            <Icon name="event" size={14} color="#666" />
                            <Text style={styles.dateLabel}>Check-in:</Text>
                            <Text style={styles.dateValue}>{formatDate(item.checkIn)}</Text>
                        </View>

                        <View style={styles.dateItem}>
                            <Icon name="event-busy" size={14} color="#666" />
                            <Text style={styles.dateLabel}>Check-out:</Text>
                            <Text style={styles.dateValue}>{formatDate(item.checkOut)}</Text>
                        </View>
                    </View>

                    {(item.numberOfAdults || item.numberOfChildren) && (
                        <View style={styles.guestsInfo}>
                            <Icon name="people" size={14} color="#666" />
                            <Text style={styles.guestsText}>
                                {item.numberOfAdults || 0} Adult{item.numberOfAdults !== 1 ? 's' : ''}
                                {item.numberOfChildren ? `, ${item.numberOfChildren} Child${item.numberOfChildren !== 1 ? 'ren' : ''}` : ''}
                            </Text>
                        </View>
                    )}

                    {item.guestName && (
                        <View style={styles.guestInfo}>
                            <Icon name="person" size={14} color="#666" />
                            <Text style={styles.guestText}>Guest: {item.guestName}</Text>
                        </View>
                    )}

                    <View style={styles.paymentInfo}>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>Total Amount:</Text>
                            <Text style={styles.totalAmount}>{formatCurrency(item.totalPrice)}</Text>
                        </View>

                        <View style={styles.paymentDetails}>
                            <View style={styles.paymentDetail}>
                                <Icon name="check-circle" size={12} color="#28a745" />
                                <Text style={styles.paymentLabel}>Paid:</Text>
                                <Text style={[styles.paymentValue, { color: '#28a745' }]}>
                                    {formatCurrency(item.paidAmount)}
                                </Text>
                            </View>

                            <View style={styles.paymentDetail}>
                                <Icon name="pending" size={12} color="#dc3545" />
                                <Text style={styles.paymentLabel}>Pending:</Text>
                                <Text style={[styles.paymentValue, { color: '#dc3545' }]}>
                                    {formatCurrency(item.pendingAmount)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {item.specialRequest && (
                        <View style={styles.specialRequestContainer}>
                            <Icon name="info" size={12} color="#666" />
                            <Text style={styles.specialRequestText} numberOfLines={2}>
                                {item.specialRequest}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.createdDate}>
                        Created: {formatDate(item.createdAt)}
                    </Text>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('BookingDetailsScreen', { booking: item })}
                    >
                        <Text style={styles.viewButtonText}>View Details</Text>
                        <Icon name="chevron-right" size={16} color="#b48a64" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="receipt-long" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptyText}>
                {selectedType === 'All'
                    ? "You haven't made any bookings yet."
                    : `No ${selectedType.toLowerCase()} bookings found.`}
            </Text>
            {bookings.length === 0 && selectedType !== 'All' && (
                <TouchableOpacity
                    style={styles.changeTypeButton}
                    onPress={() => setSelectedType('All')}
                >
                    <Text style={styles.changeTypeButtonText}>View All Bookings</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.exploreButtonText}>Explore Rooms</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
                <View style={styles.statCardLarge}>
                    <View style={styles.statIconContainer}>
                        <Icon name="event-note" size={24} color="#b48a64" />
                    </View>
                    <Text style={styles.statValue}>{stats.totalBookings}</Text>
                    <Text style={styles.statLabel}>Total Bookings</Text>
                </View>

                <View style={styles.statCardLarge}>
                    <View style={styles.statIconContainer}>
                        <Icon name="payment" size={24} color="#b48a64" />
                    </View>
                    <Text style={styles.statValue}>{formatCurrency(stats.totalAmount)}</Text>
                    <Text style={styles.statLabel}>Total Amount</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCardSmall}>
                    <View style={styles.statIconContainerSmall}>
                        <Icon name="account-balance-wallet" size={20} color="#b48a64" />
                    </View>
                    <View style={styles.statTextContainer}>
                        <Text style={styles.statValue}>{formatCurrency(stats.paidAmount)}</Text>
                        <Text style={styles.statLabel}>Paid</Text>
                    </View>
                </View>

                <View style={styles.statCardSmall}>
                    <View style={styles.statIconContainerSmall}>
                        <Icon name="history" size={20} color="#b48a64" />
                    </View>
                    <View style={styles.statTextContainer}>
                        <Text style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9f3eb" />

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
                        <Text style={styles.headerTitle}>My Bookings</Text>
                        {/* <View style={styles.roleContainer}>
                            <Text style={styles.userRole}>Member</Text>
                        </View> */}
                    </View>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => setShowFilterModal(true)}
                        activeOpacity={0.7}
                    >
                        <Icon name="filter-list" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            {/* Bookings List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#b48a64" />
                    <Text style={styles.loadingText}>Loading bookings...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderBookingCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#b48a64']}
                        />
                    }
                    ListHeaderComponent={
                        <View>
                            {/* Membership Info */}
                            <View style={styles.membershipInfo}>
                                <Icon name="badge" size={20} color="#b48a64" />
                                <Text style={styles.membershipText}>Membership: {membershipNo}</Text>
                            </View>

                            {/* Search Bar */}
                            <View style={styles.searchContainer}>
                                <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search bookings..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholderTextColor="#999"
                                />
                                {searchQuery ? (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Icon name="close" size={20} color="#666" />
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {/* Stats */}
                            {bookings.length > 0 && renderStats()}

                            {/* Type Tabs */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.tabsContainer}
                                contentContainerStyle={{ paddingHorizontal: 20 }}
                            >
                                {['All', ...bookingTypes].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.tabButton,
                                            selectedType === type && styles.tabButtonActive
                                        ]}
                                        onPress={() => handleTypeChange(type)}
                                    >
                                        <Text style={[
                                            styles.tabText,
                                            selectedType === type && styles.tabTextActive
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {bookings.length > 0 && (
                                <Text style={styles.resultsCount}>
                                    {filteredBookings.length} {selectedType.toLowerCase()} booking{filteredBookings.length !== 1 ? 's' : ''} found
                                </Text>
                            )}
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Options</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.filterSectionTitle}>Booking Type</Text>
                            <View style={styles.filterOptions}>
                                {bookingTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.filterOption,
                                            selectedType === type && styles.filterOptionActive
                                        ]}
                                        onPress={() => {
                                            handleTypeChange(type);
                                            setShowFilterModal(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            selectedType === type && styles.filterOptionTextActive
                                        ]}>
                                            {type}
                                        </Text>
                                        {selectedType === type && (
                                            <Icon name="check" size={20} color="#b48a64" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.filterSectionTitle}>Payment Status</Text>
                            <View style={styles.filterOptions}>
                                {['All', 'Paid', 'Pending', 'Unpaid'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={styles.filterOption}
                                        onPress={() => {
                                            // Add payment status filtering logic here
                                            setShowFilterModal(false);
                                        }}
                                    >
                                        <Text style={styles.filterOptionText}>{status}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setSelectedType('All');
                                    setSearchQuery('');
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text style={styles.resetButtonText}>Reset Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Replace the styles section in your existing MemberBookingsScreen.js with this:

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f0e6', // Warmer background
    },
    notch: {
        paddingTop: 35,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        height: 110,
        justifyContent: 'center',
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
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4a3728', // Dark brown for contrast
        letterSpacing: 0.5,
    },
    membershipInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginTop: 8,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginLeft: 7,
        marginRight: 7
    },
    membershipText: {
        fontSize: 16,
        color: '#212529',
        marginLeft: 10,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 15,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        height: 52,
        marginLeft: 7,
        marginRight: 7
    },
    searchIcon: {
        marginRight: 12,
        color: '#8b7355',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#4a3728',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    statsContainer: {
        marginLeft: 7,
        marginRight: 7,
        marginTop: 20,
        gap: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    statCardLarge: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    statCardSmall: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f0e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconContainerSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f0e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statTextContainer: {
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6c757d',
        fontWeight: '500',
    },
    tabsContainer: {
        marginTop: 20,
    },
    tabButton: {
        paddingHorizontal: 22,
        paddingVertical: 11,
        marginRight: 12,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e9d8c8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tabButtonActive: {
        backgroundColor: '#b48a64',
        borderColor: '#a07854',
        shadowColor: '#b48a64',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        color: '#8b7355',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 12,
        color: '#8b7355',
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        padding: 15,
        paddingBottom: 100,
    },
    resultsCount: {
        fontSize: 14,
        color: '#8b7355',
        marginBottom: 15,
        fontStyle: 'italic',
        fontWeight: '500',
        paddingLeft: 5,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#e9d8c8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0e6d8',
    },
    bookingTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f0e6',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9d8c8',
    },
    bookingTypeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8b7355',
        marginLeft: 6,
        letterSpacing: 0.3,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
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
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    bookingInfo: {
        marginBottom: 16,
    },
    roomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4a3728',
        marginLeft: 10,
    },
    datesContainer: {
        marginBottom: 12,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateLabel: {
        fontSize: 13,
        color: '#8b7355',
        marginLeft: 8,
        marginRight: 6,
        width: 70,
        fontWeight: '500',
    },
    dateValue: {
        fontSize: 14,
        color: '#4a3728',
        fontWeight: '600',
        flex: 1,
    },
    guestsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    guestsText: {
        fontSize: 13,
        color: '#8b7355',
        marginLeft: 8,
        fontWeight: '500',
    },
    guestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    guestText: {
        fontSize: 13,
        color: '#8b7355',
        marginLeft: 8,
        fontWeight: '500',
    },
    paymentInfo: {
        backgroundColor: '#faf6f0',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9d8c8',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e9d8c8',
    },
    amountLabel: {
        fontSize: 15,
        color: '#8b7355',
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#b48a64',
    },
    paymentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentLabel: {
        fontSize: 12,
        color: '#8b7355',
        marginLeft: 4,
        marginRight: 6,
        fontWeight: '500',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    specialRequestContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f7ff',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
    },
    specialRequestText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
        fontStyle: 'italic',
        lineHeight: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0e6d8',
    },
    createdDate: {
        fontSize: 11,
        color: '#a99b8c',
        fontWeight: '500',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f0e6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e9d8c8',
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#b48a64',
        marginRight: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4a3728',
        marginTop: 18,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    emptyText: {
        fontSize: 16,
        color: '#8b7355',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 24,
        fontWeight: '500',
    },
    changeTypeButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#b48a64',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    changeTypeButtonText: {
        color: '#b48a64',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    exploreButton: {
        backgroundColor: '#b48a64',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 25,
        shadowColor: '#b48a64',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: '80%',
        borderWidth: 2,
        borderColor: '#e9d8c8',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 22,
        borderBottomWidth: 2,
        borderBottomColor: '#f0e6d8',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4a3728',
        letterSpacing: 0.5,
    },
    modalContent: {
        padding: 22,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4a3728',
        marginBottom: 15,
        marginTop: 10,
        letterSpacing: 0.3,
    },
    filterOptions: {
        backgroundColor: '#faf6f0',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9d8c8',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0e6d8',
    },
    filterOptionActive: {
        backgroundColor: '#f5f0e6',
    },
    filterOptionText: {
        fontSize: 16,
        color: '#4a3728',
        fontWeight: '600',
    },
    filterOptionTextActive: {
        color: '#b48a64',
        fontWeight: '700',
    },
    modalFooter: {
        padding: 22,
        borderTopWidth: 2,
        borderTopColor: '#f0e6d8',
    },
    resetButton: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#faf6f0',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e9d8c8',
    },
    resetButtonText: {
        fontSize: 16,
        color: '#8b7355',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});