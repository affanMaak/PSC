import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Alert,
    Modal,
    Linking,
    Share,
    ActivityIndicator,
    ImageBackground,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';

export default function BookingDetailsScreen({ navigation, route }) {
    const booking = route.params?.booking;
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Safety check: go back if no booking data is passed
    if (!booking) {
        React.useEffect(() => {
            Alert.alert('Error', 'No booking data found.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }, []);
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#b48a64" />
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 Rs';
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return '0 Rs';
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount);
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
        return status.replace('_', ' ').toUpperCase();
    };

    const getBookingType = () => {
        if (booking.bookingType) return booking.bookingType;
        if (booking.roomNumber || booking.roomId) return 'Room';
        if (booking.hallId) return 'Hall';
        if (booking.lawnId) return 'Lawn';
        if (booking.photoshootId) return 'Photoshoot';
        return 'Booking';
    };

    const calculateNights = () => {
        if (!booking.checkIn || !booking.checkOut) return 0;
        try {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const diffTime = Math.abs(checkOut - checkIn);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            return 0;
        }
    };

    const handleCancelBooking = async () => {
        setShowCancelModal(false);

        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await bookingService.deleteBooking(booking.id || booking.bookingId);
                            Alert.alert(
                                'Success',
                                'Booking cancelled successfully',
                                [{ text: 'OK', onPress: () => navigation.goBack() }]
                            );
                        } catch (error) {
                            console.error('Cancel error:', error);
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to cancel booking'
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleGetInvoice = async () => {
        try {
            setLoading(true);
            const invoice = await bookingService.getInvoice(
                booking.bookingId || booking.id
            );
            setInvoiceData(invoice);
            setShowInvoiceModal(true);
        } catch (error) {
            console.error('Invoice error:', error);
            Alert.alert('Error', 'Failed to load invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleShareBooking = async () => {
        try {
            const shareMessage = `
Booking Details:
Booking ID: ${booking.bookingId || booking.id}
Type: ${getBookingType()}
Status: ${getStatusText(booking.paymentStatus)}
Amount: ${formatCurrency(booking.totalPrice)}
Check-in: ${formatDate(booking.checkIn)}
Check-out: ${formatDate(booking.checkOut)}
      `;

            await Share.share({
                message: shareMessage,
                title: 'Booking Details'
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'For any queries or modifications, please contact our support team.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call Support',
                    onPress: () => Linking.openURL('tel:+923001234567')
                },
                {
                    text: 'Email Support',
                    onPress: () => Linking.openURL('mailto:support@club.com')
                }
            ]
        );
    };

    const renderDetailItem = (label, value, icon = null, isHighlight = false) => (
        <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
                {icon && <Icon name={icon} size={18} color="#666" style={styles.detailIcon} />}
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={[
                styles.detailValue,
                isHighlight && styles.detailValueHighlight
            ]}>
                {value}
            </Text>
        </View>
    );

    const renderPaymentSummary = () => (
        <View style={styles.paymentSummaryCard}>
            <Text style={styles.cardTitle}>Payment Summary</Text>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(booking.totalPrice || booking.amount)}</Text>
            </View>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Paid Amount:</Text>
                <Text style={[styles.amountValue, { color: '#28a745' }]}>
                    {formatCurrency(booking.paidAmount || booking.paid)}
                </Text>
            </View>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Pending Amount:</Text>
                <Text style={[styles.amountValue, { color: '#dc3545' }]}>
                    {formatCurrency(booking.pendingAmount || booking.pending)}
                </Text>
            </View>

            <View style={[styles.paymentRow, styles.paymentRowTotal]}>
                <Text style={styles.paymentLabel}>Payment Status:</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(booking.paymentStatus)}20` }
                ]}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(booking.paymentStatus) }
                    ]} />
                    <Text style={[
                        styles.statusText,
                        { color: getStatusColor(booking.paymentStatus) }
                    ]}>
                        {getStatusText(booking.paymentStatus)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderBookingTimeline = () => (
        <View style={styles.timelineCard}>
            <Text style={styles.cardTitle}>Booking Timeline</Text>

            <View style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                    <Icon name="check-circle" size={20} color="#28a745" />
                </View>
                <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Booking Created</Text>
                    <Text style={styles.timelineDate}>
                        {formatDate(booking.createdAt)} • {formatTime(booking.createdAt)}
                    </Text>
                </View>
            </View>

            <View style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                    <Icon name="event" size={20} color="#b48a64" />
                </View>
                <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Check-in / Start Time</Text>
                    <Text style={styles.timelineDate}>
                        {formatDate(booking.checkIn || booking.startTime || booking.bookingDate)}
                    </Text>
                </View>
            </View>

            <View style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                    <Icon name="event-busy" size={20} color="#b48a64" />
                </View>
                <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Check-out / End Time</Text>
                    <Text style={styles.timelineDate}>
                        {formatDate(booking.checkOut || booking.endTime || booking.bookingDate)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderGuestInfo = () => {
        if (!booking.guestName && !booking.guestContact) return null;

        return (
            <View style={styles.guestCard}>
                <Text style={styles.cardTitle}>Guest Information</Text>

                {booking.guestName && renderDetailItem('Guest Name', booking.guestName, 'person')}
                {booking.guestContact && renderDetailItem('Contact', booking.guestContact, 'phone')}
                {booking.guestEmail && renderDetailItem('Email', booking.guestEmail, 'email')}
            </View>
        );
    };

    const renderRoomInfo = () => {
        if (!booking.roomNumber) return null;

        return (
            <View style={styles.roomCard}>
                <Text style={styles.cardTitle}>Room Information</Text>

                <View style={styles.roomHeader}>
                    <Icon name="meeting-room" size={24} color="#b48a64" />
                    <Text style={styles.roomNumber}>Room {booking.roomNumber}</Text>
                </View>

                <View style={styles.roomDetails}>
                    <View style={styles.detailBadge}>
                        <Icon name="nights-stay" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>{calculateNights()} Night(s)</Text>
                    </View>

                    <View style={styles.detailBadge}>
                        <Icon name="people" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>
                            {booking.numberOfAdults || 1} Adult{booking.numberOfAdults !== 1 ? 's' : ''}
                            {booking.numberOfChildren ? `, ${booking.numberOfChildren} Child${booking.numberOfChildren !== 1 ? 'ren' : ''}` : ''}
                        </Text>
                    </View>

                    <View style={styles.detailBadge}>
                        <Icon name="price-change" size={14} color="#666" />
                        <Text style={styles.detailBadgeText}>
                            {booking.pricingType === 'guest' ? 'Guest Rate' : 'Member Rate'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <ImageBackground
                source={require('../../assets/notch.jpg')}
                style={styles.notch}
                imageStyle={styles.notchImage}>
                <View style={styles.notchContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={28} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.ctext}>Booking Details</Text>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShareBooking}>
                        <Icon name="share" size={24} color="#000000" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Booking ID & Status Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bookingId}>
                            Booking #{booking.bookingId || booking.id}
                        </Text>
                        <View style={[
                            styles.statusBanner,
                            { backgroundColor: `${getStatusColor(booking.paymentStatus)}20` }
                        ]}>
                            <View style={[
                                styles.statusDotLarge,
                                { backgroundColor: getStatusColor(booking.paymentStatus) }
                            ]} />
                            <Text style={[
                                styles.statusTextLarge,
                                { color: getStatusColor(booking.paymentStatus) }
                            ]}>
                                {getStatusText(booking.paymentStatus)}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.bookingType}>{getBookingType()} Booking</Text>
                </View>

                {/* Room Information */}
                {renderRoomInfo()}

                {/* Guest Information */}
                {renderGuestInfo()}

                {/* Booking Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Booking Details</Text>

                    {renderDetailItem('Check-in / Start', formatDate(booking.checkIn || booking.startTime || booking.bookingDate), 'event')}
                    {renderDetailItem('Check-out / End', formatDate(booking.checkOut || booking.endTime || booking.bookingDate), 'event-busy')}
                    {renderDetailItem('Booking Date', formatDate(booking.createdAt || booking.bookingDate), 'schedule')}
                    {calculateNights() > 0 && renderDetailItem('Nights Stay', `${calculateNights()} night(s)`, 'nights-stay')}

                    {booking.specialRequest && (
                        <View style={styles.specialRequestContainer}>
                            <View style={styles.detailLabelContainer}>
                                <Icon name="info" size={18} color="#666" />
                                <Text style={styles.detailLabel}>Special Request</Text>
                            </View>
                            <Text style={styles.specialRequestText}>
                                {booking.specialRequest}
                            </Text>
                        </View>
                    )}

                    {booking.remarks && (
                        <View style={styles.remarksContainer}>
                            <View style={styles.detailLabelContainer}>
                                <Icon name="chat" size={18} color="#666" />
                                <Text style={styles.detailLabel}>Remarks</Text>
                            </View>
                            <Text style={styles.remarksText}>
                                {booking.remarks}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Payment Summary */}
                {renderPaymentSummary()}

                {/* Timeline */}
                {renderBookingTimeline()}

                {/* Actions Section */}
                <View style={styles.actionsCard}>
                    <Text style={styles.cardTitle}>Actions</Text>

                    <View style={styles.actionsGrid}>
                        {booking.pendingAmount > 0 && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.payButton]}
                                onPress={() => navigation.navigate('BillPaymentScreen', { booking })}
                            >
                                <Icon name="payment" size={22} color="#fff" />
                                <Text style={styles.actionButtonText}>Pay Now</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, styles.invoiceButton]}
                            onPress={handleGetInvoice}
                            disabled={loading}
                        >
                            {loading ? (
                                <Text style={styles.actionButtonText}>Loading...</Text>
                            ) : (
                                <>
                                    <Icon name="receipt" size={22} color="#b48a64" />
                                    <Text style={styles.actionButtonText}>View Invoice</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {booking.paymentStatus !== 'CANCELLED' && booking.paymentStatus !== 'REJECTED' && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => setShowCancelModal(true)}
                            >
                                <Icon name="cancel" size={22} color="#dc3545" />
                                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, styles.supportButton]}
                            onPress={handleContactSupport}
                        >
                            <Icon name="support-agent" size={22} color="#007bff" />
                            <Text style={styles.supportButtonText}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Info */}
                <View style={styles.footerInfo}>
                    <Icon name="info" size={16} color="#666" />
                    <Text style={styles.footerText}>
                        Need help? Contact our support team for any queries or modifications.
                    </Text>
                </View>
            </ScrollView>

            {/* Cancel Booking Modal */}
            <Modal
                visible={showCancelModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="warning" size={30} color="#dc3545" />
                            <Text style={styles.modalTitle}>Cancel Booking</Text>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                Are you sure you want to cancel booking #{booking.bookingId}?
                            </Text>
                            <Text style={styles.modalSubtext}>
                                This action cannot be undone. Any payments made may be subject to cancellation charges as per our policy.
                            </Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={() => setShowCancelModal(false)}
                                >
                                    <Text style={styles.cancelModalButtonText}>No, Keep It</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmCancelButton]}
                                    onPress={handleCancelBooking}
                                >
                                    <Text style={styles.confirmCancelButtonText}>Yes, Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Invoice Modal */}
            <Modal
                visible={showInvoiceModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowInvoiceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Icon name="receipt" size={30} color="#b48a64" />
                            <Text style={styles.modalTitle}>Invoice Details</Text>
                            <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.invoiceContent}>
                            {invoiceData ? (
                                <>
                                    <View style={styles.invoiceHeader}>
                                        <Text style={styles.invoiceTitle}>Invoice #{invoiceData.invoiceNumber || invoiceData.invoice_no}</Text>
                                        <Text style={styles.invoiceDate}>
                                            Issued: {formatDate(invoiceData.issued_at || new Date())}
                                        </Text>
                                    </View>

                                    <View style={styles.invoiceDetails}>
                                        {renderDetailItem('Invoice Number', invoiceData.invoiceNumber || invoiceData.invoice_no)}
                                        {renderDetailItem('Booking ID', booking.bookingId || booking.id)}
                                        {renderDetailItem('Total Amount', formatCurrency(invoiceData.total || invoiceData.totalPrice))}
                                        {renderDetailItem('Payment Mode', invoiceData.paymentMode || 'N/A')}
                                        {renderDetailItem('Issued By', invoiceData.issued_by || 'System')}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.printButton}
                                        onPress={() => {
                                            // Implement print functionality
                                            Alert.alert('Print', 'Print functionality would be implemented here.');
                                        }}
                                    >
                                        <Icon name="print" size={20} color="#fff" />
                                        <Text style={styles.printButtonText}>Print Invoice</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Text style={styles.noInvoiceText}>No invoice data available</Text>
                            )}
                        </ScrollView>
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
    notch: {
        paddingTop: 50,
        paddingBottom: 40,
        borderBottomEndRadius: 40,
        borderBottomStartRadius: 30,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        padding: 5,
    },
    shareButton: {
        position: 'absolute',
        right: 0,
        padding: 5,
    },
    ctext: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#000000',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    banner: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    bannerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDotLarge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusTextLarge: {
        fontSize: 14,
        fontWeight: '600',
    },
    bookingType: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    roomCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    roomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    roomNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b48a64',
        marginLeft: 12,
    },
    roomDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    detailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    detailBadgeText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    guestCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailIcon: {
        marginRight: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        textAlign: 'right',
        flex: 1,
    },
    detailValueHighlight: {
        color: '#b48a64',
        fontWeight: 'bold',
    },
    specialRequestContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    specialRequestText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 20,
        marginTop: 5,
    },
    remarksContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    remarksText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginTop: 5,
    },
    paymentSummaryCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
    },
    paymentRowTotal: {
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingTop: 15,
        marginTop: 5,
    },
    paymentLabel: {
        fontSize: 15,
        color: '#666',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#b48a64',
    },
    amountValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    timelineCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineDot: {
        width: 40,
        alignItems: 'center',
    },
    timelineContent: {
        flex: 1,
        marginLeft: 10,
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 13,
        color: '#666',
    },
    actionsCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        flex: 1,
        minWidth: '48%',
        gap: 8,
    },
    payButton: {
        backgroundColor: '#28a745',
    },
    invoiceButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#b48a64',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    supportButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#007bff',
    },
    actionButtonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButtonText: {
        color: '#dc3545',
        fontWeight: '600',
        fontSize: 14,
    },
    supportButtonText: {
        color: '#007bff',
        fontWeight: '600',
        fontSize: 14,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f7ff',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#b48a64',
    },
    footerText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        marginLeft: 10,
        lineHeight: 18,
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
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
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
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginLeft: 10,
    },
    modalContent: {
        padding: 20,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelModalButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    confirmCancelButton: {
        backgroundColor: '#dc3545',
    },
    cancelModalButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    confirmCancelButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    invoiceContent: {
        padding: 20,
    },
    invoiceHeader: {
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    invoiceDate: {
        fontSize: 14,
        color: '#666',
    },
    invoiceDetails: {
        marginBottom: 20,
    },
    printButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#b48a64',
        padding: 15,
        borderRadius: 10,
        gap: 10,
        marginTop: 20,
    },
    printButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    noInvoiceText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
});