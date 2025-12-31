import React, { useState, useRef, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    StatusBar,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    Alert,
    ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import HtmlRenderer from '../events/HtmlRenderer'; // Adjust path as needed
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

const SportDetailsScreen = ({ route }) => {
    const { sport } = route.params;
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('overview');
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [moreAboutModalVisible, setMoreAboutModalVisible] = useState(false);
    const [moreAboutModalContent, setMoreAboutModalContent] = useState({ title: '', data: [], sections: null, numbered: false });

    const tabs = [
        { key: 'More About', title: 'More About' },
        { key: 'overview', title: 'Overview' },

        // { key: 'pricing', title: 'Pricing' },
        // { key: 'timing', title: 'Timing' },
        // { key: 'rules', title: 'Rules' },
    ];

    // Debug log to see what data we're receiving
    useEffect(() => {
        console.log('Sport details data:', JSON.stringify(sport, null, 2));
    }, [sport]);

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    // Helper function to get charge type label
    const getChargeLabel = (type) => {
        if (!type) return 'N/A';
        const types = {
            PER_DAY: 'Per Day',
            PER_MONTH: 'Per Month',
            PER_GAME: 'Per Game',
            PER_HOUR: 'Per Hour',
            PER_SESSION: 'Per Session',
        };
        return types[type] || type.replace('_', ' ').toLowerCase();
    };

    // Helper function to format day name
    const formatDayName = (day) => {
        return day.charAt(0).toUpperCase() + day.slice(1);
    };

    // Extract timing data from API format
    const getTimingData = () => {
        const timing = sport.timing || {};

        // If timing is a string (old format), convert to object
        if (typeof timing === 'string') {
            try {
                return JSON.parse(timing);
            } catch (e) {
                console.log('Error parsing timing string:', e);
                return {};
            }
        }

        return timing;
    };

    const getLadiesTimingData = () => {
        const timingLadies = sport.timingLadies || {};

        // If timingLadies is a string (old format), convert to object
        if (typeof timingLadies === 'string') {
            try {
                return JSON.parse(timingLadies);
            } catch (e) {
                console.log('Error parsing timingLadies string:', e);
                return {};
            }
        }

        return timingLadies;
    };

    // Extract charges data
    const getCharges = () => {
        return sport.sportCharge || [];
    };

    // Function to open More About modal
    const openMoreAboutModal = (type) => {
        const charges = getCharges();
        const timingGents = getTimingData();
        const timingLadies = getLadiesTimingData();

        let content = { title: '', data: [], sections: null, numbered: false };

        switch (type) {
            case 'rates':
                // Build rates sections from backend data
                const rateSections = [];
                charges.forEach((charge) => {
                    const items = [
                        `Member - ${formatCurrency(charge.memberCharges || 0)}`,
                        `Spouse - ${formatCurrency(charge.spouseCharges || 0)}`,
                        `Children - ${formatCurrency(charge.childrenCharges || 0)}`,
                        `Guest - ${formatCurrency(charge.guestCharges || 0)}`,
                        `Affiliated Clubs - ${formatCurrency(charge.affiliatedClubCharges || 0)}`,
                    ];
                    rateSections.push({
                        subtitle: getChargeLabel(charge.chargeType),
                        items: items
                    });
                });
                content = {
                    title: 'Rates',
                    sections: rateSections.length > 0 ? rateSections : null,
                    data: rateSections.length === 0 ? ['No rates available'] : []
                };
                break;

            case 'timings':
                const timingData = [];
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

                // Add Gents timing
                if (timingGents && Object.keys(timingGents).length > 0) {
                    timingData.push('Gents Timing:');
                    days.forEach((day) => {
                        const timing = timingGents[day];
                        if (timing) {
                            if (timing.isClosed) {
                                timingData.push(`${formatDayName(day)}: Closed`);
                            } else {
                                timingData.push(`${formatDayName(day)}: ${timing.open || '09:00 AM'} - ${timing.close || '05:00 PM'}`);
                            }
                        }
                    });
                }

                // Add Ladies timing
                if (timingLadies && Object.keys(timingLadies).length > 0) {
                    timingData.push('');
                    timingData.push('Ladies Timing:');
                    days.forEach((day) => {
                        const timing = timingLadies[day];
                        if (timing) {
                            if (timing.isClosed) {
                                timingData.push(`${formatDayName(day)}: Closed`);
                            } else {
                                timingData.push(`${formatDayName(day)}: ${timing.open || '09:00 AM'} - ${timing.close || '05:00 PM'}`);
                            }
                        }
                    });
                }

                content = {
                    title: 'Timings',
                    subtitle: sport.closedDay ? `Closed on ${sport.closedDay}` : '',
                    data: timingData.length > 0 ? timingData : ['No timing information available']
                };
                break;

            case 'dressCode':
                const dressCodeSections = [];

                if (sport.dressCodeDos) {
                    // Parse HTML content to extract items
                    const dosText = sport.dressCodeDos.replace(/<[^>]*>/g, '').split('\n').filter(item => item.trim());
                    dressCodeSections.push({
                        subtitle: "Do's",
                        items: dosText.length > 0 ? dosText : ['No dress code do\'s specified']
                    });
                }

                if (sport.dressCodeDonts) {
                    const dontsText = sport.dressCodeDonts.replace(/<[^>]*>/g, '').split('\n').filter(item => item.trim());
                    dressCodeSections.push({
                        subtitle: "Don'ts",
                        items: dontsText.length > 0 ? dontsText : ['No dress code don\'ts specified']
                    });
                }

                content = {
                    title: 'Dress Code',
                    sections: dressCodeSections.length > 0 ? dressCodeSections : null,
                    data: dressCodeSections.length === 0 ? ['No dress code information available'] : []
                };
                break;

            case 'dosAndDonts':
                const rulesData = [];

                if (sport.dos) {
                    const dosText = sport.dos.replace(/<[^>]*>/g, '').split('\n').filter(item => item.trim());
                    rulesData.push(...dosText);
                }

                if (sport.donts) {
                    const dontsText = sport.donts.replace(/<[^>]*>/g, '').split('\n').filter(item => item.trim());
                    rulesData.push(...dontsText);
                }

                content = {
                    title: "Do's & Don'ts",
                    subtitle: 'NOTE',
                    numbered: true,
                    data: rulesData.length > 0 ? rulesData : ['No rules available']
                };
                break;

            default:
                content = { title: 'Information', data: ['No information available'] };
        }

        setMoreAboutModalContent(content);
        setMoreAboutModalVisible(true);
    };

    // Render More About Tab
    const renderMoreAboutTab = () => (
        <View style={styles.moreAboutContainer}>
            <Text style={styles.moreAboutTitle}>
                MORE ABOUT <Text style={styles.moreAboutTitleGold}>SPORTS</Text>
            </Text>

            {/* Info Cards Grid */}
            <View style={styles.cardsContainer}>
                {/* First Row - 3 Cards */}
                <View style={styles.cardRow}>
                    {/* Rates Card */}
                    <TouchableOpacity style={styles.card} onPress={() => openMoreAboutModal('rates')}>
                        <View style={styles.iconContainer}>
                            <Icon name="attach-money" size={40} color="#000" />
                        </View>
                        <Text style={styles.cardText}>Rates</Text>
                    </TouchableOpacity>

                    {/* Timings Card */}
                    <TouchableOpacity style={styles.card} onPress={() => openMoreAboutModal('timings')}>
                        <View style={styles.iconContainer}>
                            <Icon name="access-time" size={40} color="#000" />
                        </View>
                        <Text style={styles.cardText}>Timings</Text>
                    </TouchableOpacity>

                    {/* Dress Code Card */}
                    <TouchableOpacity style={styles.card} onPress={() => openMoreAboutModal('dressCode')}>
                        <View style={styles.iconContainer}>
                            <Icon name="person" size={40} color="#000" />
                        </View>
                        <Text style={styles.cardText}>Dress Code</Text>
                    </TouchableOpacity>
                </View>

                {/* Second Row - 1 Card aligned left */}
                <View style={styles.cardRowLeft}>
                    {/* Do's & Don'ts Card */}
                    <TouchableOpacity style={styles.card} onPress={() => openMoreAboutModal('dosAndDonts')}>
                        <View style={styles.iconContainerDark}>
                            <Icon name="close" size={28} color="#FFF" />
                        </View>
                        <Text style={styles.cardText}>Do's & Don'ts</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Render images gallery
    const renderImagesGallery = () => {
        const images = sport.images || [];

        if (images.length === 0) {
            return (
                <View style={styles.noImagesContainer}>
                    <Icon name="image" size={50} color="#CCCCCC" />
                    <Text style={styles.noImagesText}>No images available</Text>
                </View>
            );
        }

        return (
            <View style={styles.imagesSection}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <FlatList
                    data={images}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedImage(item);
                                setImageModalVisible(true);
                            }}
                            style={styles.imageTouchable}
                        >
                            <Image
                                source={{ uri: item }}
                                style={styles.galleryImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.galleryContainer}
                />
            </View>
        );
    };

    // Overview Tab Content
    const renderOverviewTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={[
                styles.statusContainer,
                sport.isActive ? styles.activeContainer : styles.inactiveContainer
            ]}>
                <Icon
                    name={sport.isActive ? "check-circle" : "cancel"}
                    size={20}
                    color={sport.isActive ? "#4CAF50" : "#9E9E9E"}
                />
                <Text style={[
                    styles.statusText,
                    sport.isActive ? styles.activeText : styles.inactiveText
                ]}>
                    {sport.isActive ? 'Active' : 'Inactive'}
                </Text>
            </View>

            {/* Description */}
            {sport.description && (
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{sport.description}</Text>
                </View>
            )}

            {/* Images Gallery */}
            {renderImagesGallery()}
        </ScrollView>
    );

    // Pricing Tab Content
    const renderPricingTab = () => {
        const charges = getCharges();

        if (charges.length === 0) {
            return (
                <View style={styles.emptyTab}>
                    <Icon name="attach-money" size={50} color="#CCCCCC" />
                    <Text style={styles.emptyTabText}>No pricing information available</Text>
                </View>
            );
        }

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Pricing Details</Text>
                {charges.map((charge, index) => (
                    <View key={index} style={styles.chargeCard}>
                        <View style={styles.chargeHeader}>
                            <Text style={styles.chargeType}>{getChargeLabel(charge.chargeType)}</Text>
                            <View style={styles.priceBadge}>
                                <Text style={styles.priceBadgeText}>
                                    PKR {formatCurrency(charge.memberCharges || 0)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.chargeDetails}>
                            <View style={styles.chargeRow}>
                                <Text style={styles.chargeLabel}>Member:</Text>
                                <Text style={styles.chargeValue}>PKR {formatCurrency(charge.memberCharges || 0)}</Text>
                            </View>
                            <View style={styles.chargeRow}>
                                <Text style={styles.chargeLabel}>Spouse:</Text>
                                <Text style={styles.chargeValue}>PKR {formatCurrency(charge.spouseCharges || 0)}</Text>
                            </View>
                            <View style={styles.chargeRow}>
                                <Text style={styles.chargeLabel}>Children:</Text>
                                <Text style={styles.chargeValue}>PKR {formatCurrency(charge.childrenCharges || 0)}</Text>
                            </View>
                            <View style={styles.chargeRow}>
                                <Text style={styles.chargeLabel}>Guest:</Text>
                                <Text style={styles.chargeValue}>PKR {formatCurrency(charge.guestCharges || 0)}</Text>
                            </View>
                            <View style={styles.chargeRow}>
                                <Text style={styles.chargeLabel}>Affiliated Club:</Text>
                                <Text style={styles.chargeValue}>PKR {formatCurrency(charge.affiliatedClubCharges || 0)}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    };

    // Timing Tab Content
    const renderTimingTab = () => {
        const timingGents = getTimingData();
        const timingLadies = getLadiesTimingData();

        const hasGentsTiming = timingGents && Object.keys(timingGents).length > 0;
        const hasLadiesTiming = timingLadies && Object.keys(timingLadies).length > 0;

        // Check for old format timing (simple string properties)
        const hasOldTimingFormat = sport.timing && (
            sport.timing.weekdays ||
            sport.timing.men ||
            sport.timing.weekends ||
            sport.timing.ladies
        );

        if (!hasGentsTiming && !hasLadiesTiming && !hasOldTimingFormat) {
            return (
                <View style={styles.emptyTab}>
                    <Icon name="schedule" size={50} color="#CCCCCC" />
                    <Text style={styles.emptyTabText}>No timing information available</Text>
                </View>
            );
        }

        // Handle old format timing
        if (hasOldTimingFormat) {
            const oldTiming = sport.timing;
            return (
                <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>Timing Information</Text>
                    <View style={styles.timingSection}>
                        {oldTiming.weekdays && (
                            <View style={styles.timingRow}>
                                <Text style={styles.dayText}>Weekdays:</Text>
                                <Text style={styles.timeText}>{oldTiming.weekdays}</Text>
                            </View>
                        )}
                        {oldTiming.weekends && (
                            <View style={styles.timingRow}>
                                <Text style={styles.dayText}>Weekends:</Text>
                                <Text style={styles.timeText}>{oldTiming.weekends}</Text>
                            </View>
                        )}
                        {oldTiming.men && (
                            <View style={styles.timingRow}>
                                <Text style={styles.dayText}>Men:</Text>
                                <Text style={styles.timeText}>{oldTiming.men}</Text>
                            </View>
                        )}
                        {oldTiming.ladies && (
                            <View style={styles.timingRow}>
                                <Text style={styles.dayText}>Ladies:</Text>
                                <Text style={styles.timeText}>{oldTiming.ladies}</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            );
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Opening Hours</Text>

                {hasGentsTiming && (
                    <View style={styles.timingSection}>
                        <Text style={styles.timingSectionTitle}>Gents Timing</Text>
                        {days.map((day) => {
                            const timing = timingGents[day];
                            if (!timing) return null;

                            return (
                                <View key={day} style={styles.timingRow}>
                                    <Text style={styles.dayText}>{formatDayName(day)}</Text>
                                    {timing.isClosed ? (
                                        <Text style={styles.closedText}>Closed</Text>
                                    ) : (
                                        <Text style={styles.timeText}>
                                            {timing.open || '09:00 AM'} - {timing.close || '05:00 PM'}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {hasLadiesTiming && (
                    <View style={styles.timingSection}>
                        <Text style={styles.timingSectionTitle}>Ladies Timing</Text>
                        {days.map((day) => {
                            const timing = timingLadies[day];
                            if (!timing) return null;

                            return (
                                <View key={day} style={styles.timingRow}>
                                    <Text style={styles.dayText}>{formatDayName(day)}</Text>
                                    {timing.isClosed ? (
                                        <Text style={styles.closedText}>Closed</Text>
                                    ) : (
                                        <Text style={styles.timeText}>
                                            {timing.open || '09:00 AM'} - {timing.close || '05:00 PM'}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        );
    };

    // Rules Tab Content
    const renderRulesTab = () => {
        const hasDressCode = sport.dressCodeDos || sport.dressCodeDonts;
        const hasGeneralRules = sport.dos || sport.donts;

        if (!hasDressCode && !hasGeneralRules) {
            return (
                <View style={styles.emptyTab}>
                    <Icon name="rule" size={50} color="#CCCCCC" />
                    <Text style={styles.emptyTabText}>No rules information available</Text>
                </View>
            );
        }

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                {/* Dress Code */}
                {hasDressCode && (
                    <View style={styles.rulesSection}>
                        <Text style={styles.sectionTitle}>Dress Code</Text>

                        {sport.dressCodeDos && (
                            <View style={[styles.ruleCard, styles.dosCard]}>
                                <View style={styles.ruleHeader}>
                                    <Icon name="check-circle" size={20} color="#4CAF50" />
                                    <Text style={styles.ruleTitle}>Do's</Text>
                                </View>
                                <View style={styles.htmlContainer}>
                                    <HtmlRenderer
                                        htmlContent={sport.dressCodeDos}
                                        textStyle={styles.htmlContent}
                                    />
                                </View>
                            </View>
                        )}

                        {sport.dressCodeDonts && (
                            <View style={[styles.ruleCard, styles.dontsCard]}>
                                <View style={styles.ruleHeader}>
                                    <Icon name="cancel" size={20} color="#F44336" />
                                    <Text style={styles.ruleTitle}>Don'ts</Text>
                                </View>
                                <View style={styles.htmlContainer}>
                                    <HtmlRenderer
                                        htmlContent={sport.dressCodeDonts}
                                        textStyle={styles.htmlContent}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* General Rules */}
                {hasGeneralRules && (
                    <View style={styles.rulesSection}>
                        <Text style={styles.sectionTitle}>General Rules</Text>

                        {sport.dos && (
                            <View style={[styles.ruleCard, styles.dosCard]}>
                                <View style={styles.ruleHeader}>
                                    <Icon name="check-circle" size={20} color="#4CAF50" />
                                    <Text style={styles.ruleTitle}>Do's</Text>
                                </View>
                                <View style={styles.htmlContainer}>
                                    <HtmlRenderer
                                        htmlContent={sport.dos}
                                        textStyle={styles.htmlContent}
                                    />
                                </View>
                            </View>
                        )}

                        {sport.donts && (
                            <View style={[styles.ruleCard, styles.dontsCard]}>
                                <View style={styles.ruleHeader}>
                                    <Icon name="cancel" size={20} color="#F44336" />
                                    <Text style={styles.ruleTitle}>Don'ts</Text>
                                </View>
                                <View style={styles.htmlContainer}>
                                    <HtmlRenderer
                                        htmlContent={sport.donts}
                                        textStyle={styles.htmlContent}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        );
    };

    // Render active tab content
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverviewTab();
            case 'More About':
                return renderMoreAboutTab();
            case 'pricing':
                return renderPricingTab();
            case 'timing':
                return renderTimingTab();
            case 'rules':
                return renderRulesTab();
            default:
                return renderOverviewTab();
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading sport details...</Text>
            </View>
        );
    }

    if (!sport) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error" size={60} color="#FF6B6B" />
                <Text style={styles.errorText}>No sport data available</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* 🔹 Notch Header with Back Button */}
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
                        <Text style={styles.headerTitle}>{sport.activity || 'Sport Details'}</Text>
                        <View style={styles.placeholder} />
                    </View>
                </ImageBackground>

                {/* 🔹 Image Slider */}
                {sport.images && sport.images.length > 0 ? (
                    <View style={styles.sliderContainer}>
                        <Swiper
                            autoplay
                            autoplayTimeout={4}
                            loop
                            showsPagination
                            activeDotColor="#A3834C"
                            dotColor="#D3D3D3"
                        >
                            {sport.images.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image }}
                                    style={styles.sliderImage}
                                    resizeMode="cover"
                                />
                            ))}
                        </Swiper>
                    </View>
                ) : (
                    <View style={styles.sliderContainer}>
                        <Image
                            source={require('../../assets/logo.jpeg')}
                            style={styles.sliderImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Custom Tab Bar */}
                <View style={styles.tabBarContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabScrollContainer}
                    >
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[
                                    styles.tabItem,
                                    activeTab === tab.key && styles.activeTabItem
                                ]}
                                onPress={() => setActiveTab(tab.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === tab.key && styles.activeTabText
                                ]}>
                                    {tab.title}
                                </Text>
                                {activeTab === tab.key && (
                                    <View style={styles.tabIndicator} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tab Content */}
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.tabContentContainer}>
                        {renderActiveTab()}
                    </View>
                </SafeAreaView>

                {/* Image Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={imageModalVisible}
                    onRequestClose={() => setImageModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setImageModalVisible(false)}
                        >
                            <Icon name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: selectedImage || sport.images?.[0] }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>

                {/* More About Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={moreAboutModalVisible}
                    onRequestClose={() => setMoreAboutModalVisible(false)}
                >
                    <View style={styles.moreAboutModalOverlay}>
                        <View style={styles.moreAboutModalContainer}>
                            {/* Modal Header */}
                            <View style={styles.moreAboutModalHeader}>
                                <Text style={styles.moreAboutModalTitle}>{moreAboutModalContent.title}</Text>
                                <TouchableOpacity
                                    style={styles.moreAboutCloseButton}
                                    onPress={() => setMoreAboutModalVisible(false)}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="close" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            {/* Modal Content - Check if sections exist (for Rates/Dress Code) */}
                            {moreAboutModalContent.sections ? (
                                <ScrollView style={styles.moreAboutModalScrollView} showsVerticalScrollIndicator={false}>
                                    {moreAboutModalContent.sections.map((section, sectionIndex) => (
                                        <View key={sectionIndex} style={styles.moreAboutSectionContainer}>
                                            <Text style={styles.moreAboutModalSubtitle}>{section.subtitle}</Text>
                                            <View style={styles.moreAboutModalContent}>
                                                {section.items.map((item, index) => (
                                                    <View key={index} style={styles.moreAboutListItem}>
                                                        <Text style={styles.moreAboutBullet}>•</Text>
                                                        <Text style={styles.moreAboutListText}>{item}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : moreAboutModalContent.numbered ? (
                                <>
                                    <Text style={styles.moreAboutModalSubtitle}>{moreAboutModalContent.subtitle}</Text>
                                    <ScrollView style={styles.moreAboutModalScrollView} showsVerticalScrollIndicator={false}>
                                        <View style={styles.moreAboutModalContent}>
                                            {moreAboutModalContent.data?.map((item, index) => (
                                                <View key={index} style={styles.moreAboutNumberedListItem}>
                                                    <Text style={styles.moreAboutNumberText}>{index + 1}.</Text>
                                                    <Text style={styles.moreAboutListText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </>
                            ) : (
                                <>
                                    {moreAboutModalContent.subtitle && (
                                        <Text style={styles.moreAboutModalSubtitle}>{moreAboutModalContent.subtitle}</Text>
                                    )}
                                    <ScrollView style={styles.moreAboutModalScrollView} showsVerticalScrollIndicator={false}>
                                        <View style={styles.moreAboutModalContent}>
                                            {moreAboutModalContent.data?.map((item, index) => (
                                                <View key={index} style={styles.moreAboutListItem}>
                                                    <Text style={styles.moreAboutBullet}>•</Text>
                                                    <Text style={styles.moreAboutListText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF9F3',
    },
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
        minHeight: 120,
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 40,
    },
    sliderContainer: {
        height: 200,
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    sliderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEF9F3',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEF9F3',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#333',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#A3834C',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    safeArea: {
        flex: 1,
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    inactiveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(158, 158, 158, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeTextSmall: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '600',
    },
    inactiveTextSmall: {
        fontSize: 12,
        color: '#9E9E9E',
        marginLeft: 4,
        fontWeight: '600',
    },
    // Custom Tab Bar Styles
    tabBarContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginTop: 20,
        marginLeft: 100,
        marginRight: 100,
    },
    tabScrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabItem: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: 'relative',
    },
    activeTabItem: {
        backgroundColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    activeTabText: {
        color: '#A3834C',
        fontWeight: '700',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#A3834C',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    tabContentContainer: {
        flex: 1,
        backgroundColor: '#FEF9F3',
    },
    tabContent: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FEF9F3',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 20,
    },
    activeContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    inactiveContainer: {
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        borderWidth: 1,
        borderColor: '#9E9E9E',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    activeText: {
        color: '#4CAF50',
    },
    inactiveText: {
        color: '#9E9E9E',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    descriptionSection: {
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    imagesSection: {
        marginBottom: 24,
    },
    galleryContainer: {
        paddingRight: 16,
    },
    imageTouchable: {
        marginRight: 12,
    },
    galleryImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    noImagesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    noImagesText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
    emptyTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTabText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
        textAlign: 'center',
    },
    chargeCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    chargeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    chargeType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    priceBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    priceBadgeText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    chargeDetails: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 12,
    },
    chargeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    chargeLabel: {
        fontSize: 14,
        color: '#666',
    },
    chargeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    timingSection: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    timingSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    timingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    dayText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        textAlign: 'right',
    },
    closedText: {
        fontSize: 14,
        color: '#F44336',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    rulesSection: {
        marginBottom: 24,
    },
    ruleCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    dosCard: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    dontsCard: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(244, 67, 54, 0.3)',
    },
    ruleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ruleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    htmlContainer: {
        marginTop: 8,
    },
    htmlContent: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    modalImage: {
        width: width * 0.9,
        height: width * 0.9,
    },
    // More About Section Styles
    moreAboutContainer: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 30,
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    moreAboutTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    moreAboutTitleGold: {
        color: '#A3834C',
    },
    cardsContainer: {
        width: '100%',
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    cardRowLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    card: {
        backgroundColor: '#C4A570',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '31%',
        minHeight: 110,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    iconContainer: {
        marginBottom: 8,
    },
    iconContainerDark: {
        backgroundColor: '#2C2C2C',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
    },
    cardText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    // More About Modal Styles
    moreAboutModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreAboutModalContainer: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        maxHeight: '80%',
    },
    moreAboutModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    moreAboutModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    moreAboutCloseButton: {
        backgroundColor: '#E57373',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreAboutModalSubtitle: {
        fontSize: 16,
        color: '#C4A570',
        fontWeight: '600',
        marginBottom: 15,
    },
    moreAboutModalContent: {
        paddingLeft: 5,
    },
    moreAboutModalScrollView: {
        maxHeight: 400,
    },
    moreAboutSectionContainer: {
        marginBottom: 15,
    },
    moreAboutListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    moreAboutNumberedListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    moreAboutNumberText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginRight: 10,
        minWidth: 24,
        lineHeight: 22,
    },
    moreAboutBullet: {
        fontSize: 18,
        color: '#000',
        marginRight: 10,
        lineHeight: 22,
    },
    moreAboutListText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
});

export default SportDetailsScreen; 