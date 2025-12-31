// // // import React, { useState } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   ScrollView,
// // //   StyleSheet,
// // //   StatusBar,
// // // } from 'react-native';

// // // const BillPaymentScreen = () => {
// // //   const [membershipNumber, setMembershipNumber] = useState('32001');
// // //   const [membershipName, setMembershipName] = useState('Ali Khan Training App');
// // //   const [status, setStatus] = useState('');
// // //   const [amount, setAmount] = useState('');
// // //   const [selectedMethod, setSelectedMethod] = useState('');

// // //   const paymentMethods = [
// // //     { id: 'cash', label: 'Cash Payment', icon: '💵' },
// // //     { id: 'cheque', label: 'Via Cheque', icon: '📧' },
// // //     { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
// // //     { id: 'mobile', label: 'Via Mobile App', icon: '📱' },
// // //     { id: 'onebill', label: 'One Bill', icon: '📄' },
// // //   ];

// // //   return (
// // //     <View style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

// // //       Header
// // //       <View style={styles.header}>
// // //         <TouchableOpacity style={styles.backButton}>
// // //           <Text style={styles.backIcon}>←</Text>
// // //         </TouchableOpacity>
// // //         <Text style={styles.headerTitle}>Bill Payment</Text>
// // //         <View style={styles.placeholder} />
// // //       </View>

// // //       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
// // //         {/* User Information Section */}
// // //         <View style={styles.section}>
// // //           <Text style={styles.sectionTitle}>User Information</Text>

// // //           <View style={styles.inputGroup}>
// // //             <Text style={styles.label}>Membership Number</Text>
// // //             <TextInput
// // //               style={styles.input}
// // //               value={membershipNumber}
// // //               onChangeText={setMembershipNumber}
// // //               keyboardType="numeric"
// // //             />
// // //           </View>

// // //           <View style={styles.inputGroup}>
// // //             <Text style={styles.label}>Membership name</Text>
// // //             <TextInput
// // //               style={styles.input}
// // //               value={membershipName}
// // //               onChangeText={setMembershipName}
// // //             />
// // //           </View>
// // //         </View>

// // //         {/* Bill Details Section */}
// // //         <View style={styles.section}>
// // //           <Text style={styles.sectionTitle}>Bill Details</Text>

// // //           <View style={styles.inputGroup}>
// // //             <Text style={styles.label}>Status</Text>
// // //             <TextInput
// // //               style={styles.input}
// // //               value={status}
// // //               onChangeText={setStatus}
// // //               placeholder="Enter status"
// // //               placeholderTextColor="#999"
// // //             />
// // //           </View>

// // //           <View style={styles.inputGroup}>
// // //             <Text style={styles.label}>Amount</Text>
// // //             <TextInput
// // //               style={styles.input}
// // //               value={amount}
// // //               onChangeText={setAmount}
// // //               placeholder="Rs. 0"
// // //               placeholderTextColor="#999"
// // //               keyboardType="numeric"
// // //             />
// // //           </View>
// // //         </View>

// // //         {/* Bill Payment Via Section */}
// // //         <View style={styles.section}>
// // //           <Text style={styles.sectionSubtitle}>
// // //             Bill Payment Via <Text style={styles.billTopUp}>( Bill/Top up )</Text> Live
// // //           </Text>
// // //           <Text style={styles.selectChannel}>Select channel</Text>

// // //           {/* Payment Methods Grid */}
// // //           <View style={styles.paymentGrid}>
// // //             {paymentMethods.map((method) => (
// // //               <TouchableOpacity
// // //                 key={method.id}
// // //                 style={[
// // //                   styles.paymentMethod,
// // //                   selectedMethod === method.id && styles.paymentMethodSelected,
// // //                 ]}
// // //                 onPress={() => setSelectedMethod(method.id)}
// // //               >
// // //                 <View style={styles.iconCircle}>
// // //                   <Text style={styles.icon}>{method.icon}</Text>
// // //                 </View>
// // //                 <Text style={styles.methodLabel}>{method.label}</Text>
// // //               </TouchableOpacity>
// // //             ))}
// // //           </View>
// // //         </View>

// // //         {/* E-Payment Procedures Section */}
// // //         <View style={styles.section}>
// // //           <Text style={styles.proceduresTitle}>E - PAYMENT PROCEDURES</Text>
// // //           <Text style={styles.proceduresSubtitle}>Bill Payment</Text>

// // //           <View style={styles.proceduresList}>
// // //             <Text style={styles.procedureItem}>
// // //               • HBL eConnect holders can conveniently conduct payments via Credit Card or Debit Card. All you need to do is a simple log-in to your HBL app on your mobile phone and you can process your payment.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • HBL eConnect user need to add their dropdown menu after your Membership number and amount are selected. Pay and proceed with your payment.
// // //             </Text>
// // //             <Text style={styles.procedureItemHighlight}>
// // //               BILL TOP UP
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • You can simply pay your bill using the 'Bill/Top Up' option available in your E-Sahulat or any Micro ATM.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • Navigate to the 'Bill/Top Up' option in your E-Sahulat App.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • Choose HBL Microfinance Bank Limited/NRSP/microfinance/1 bill payment, if both the above options are available.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • Add the company Code, your Membership Code, Phone number and amount.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • After entering the G. press enter. Your Membership name and CNIC will show up and proceed with your payment.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • The amount will be posted to any transaction account.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • It is payable in account without any discount.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • All e-Sahulat fee will be borne from your own bank account slip.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • The deadline for paying PG Bill is 28th of every month where an individual has not paid by the due date.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • Monthly payments will be processed based on the Membership end date. All member login portal at: www.alikhantraining.com
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • In case of E-Sahulat non-payment and Terminated members cannot access to gym or do not get access and facilities of the gym. If you have paid your payment but still did not have access to everyone Services Dues incomplete attendance please contact us by addressing a copy of your bill.
// // //             </Text>
// // //             <Text style={styles.procedureItem}>
// // //               • Do not pay any extra amount. In case of any query, please reach out to us.
// // //             </Text>
// // //           </View>
// // //         </View>
// // //       </ScrollView>
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#f5f5f5',
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 12,
// // //     backgroundColor: '#fff',
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#e0e0e0',
// // //   },
// // //   backButton: {
// // //     padding: 8,
// // //   },
// // //   backIcon: {
// // //     fontSize: 24,
// // //     color: '#333',
// // //   },
// // //   headerTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //   },
// // //   placeholder: {
// // //     width: 40,
// // //   },
// // //   content: {
// // //     flex: 1,
// // //   },
// // //   section: {
// // //     backgroundColor: '#fff',
// // //     marginTop: 12,
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 16,
// // //   },
// // //   sectionTitle: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 16,
// // //   },
// // //   sectionSubtitle: {
// // //     fontSize: 15,
// // //     fontWeight: '500',
// // //     color: '#333',
// // //     marginBottom: 4,
// // //   },
// // //   billTopUp: {
// // //     color: '#666',
// // //     fontSize: 13,
// // //   },
// // //   selectChannel: {
// // //     fontSize: 13,
// // //     color: '#666',
// // //     marginBottom: 16,
// // //   },
// // //   inputGroup: {
// // //     marginBottom: 16,
// // //   },
// // //   label: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginBottom: 8,
// // //   },
// // //   input: {
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 10,
// // //     fontSize: 15,
// // //     color: '#333',
// // //     backgroundColor: '#fff',
// // //   },
// // //   paymentGrid: {
// // //     flexDirection: 'row',
// // //     flexWrap: 'wrap',
// // //     marginHorizontal: -6,
// // //   },
// // //   paymentMethod: {
// // //     width: '33.33%',
// // //     paddingHorizontal: 6,
// // //     marginBottom: 16,
// // //     alignItems: 'center',
// // //   },
// // //   paymentMethodSelected: {
// // //     opacity: 0.7,
// // //   },
// // //   iconCircle: {
// // //     width: 70,
// // //     height: 70,
// // //     borderRadius: 35,
// // //     backgroundColor: '#4CAF50',
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     marginBottom: 8,
// // //   },
// // //   icon: {
// // //     fontSize: 32,
// // //   },
// // //   methodLabel: {
// // //     fontSize: 12,
// // //     color: '#333',
// // //     textAlign: 'center',
// // //     lineHeight: 16,
// // //   },
// // //   proceduresTitle: {
// // //     fontSize: 15,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 8,
// // //     textAlign: 'center',
// // //   },
// // //   proceduresSubtitle: {
// // //     fontSize: 14,
// // //     fontWeight: '500',
// // //     color: '#666',
// // //     marginBottom: 12,
// // //   },
// // //   proceduresList: {
// // //     paddingLeft: 8,
// // //   },
// // //   procedureItem: {
// // //     fontSize: 13,
// // //     color: '#555',
// // //     lineHeight: 20,
// // //     marginBottom: 10,
// // //   },
// // //   procedureItemHighlight: {
// // //     fontSize: 13,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 10,
// // //   },
// // // });

// // // export default BillPaymentScreen;

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   StyleSheet,
// //   StatusBar,
// //   ImageBackground,
// //   Modal,
// //   Image
// // } from 'react-native';
// // import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// // import { useAuth } from '../src/auth/contexts/AuthContext';

// // const BillPaymentScreen = ({ navigation }) => {
// //   const { user } = useAuth();
// //   const [membershipNumber, setMembershipNumber] = useState('');
// //   const [membershipName, setMembershipName] = useState('');
// //   const [status, setStatus] = useState('');
// //   const [amount, setAmount] = useState('');
// //   const [selectedBank, setSelectedBank] = useState('');
// //   const [dropdownVisible, setDropdownVisible] = useState(false);
// //   const [selectedPaymentMode, setSelectedPaymentMode] = useState('');

// //   useEffect(() => {
// //     if (user) {
// //       setMembershipNumber(user.membershipNo || user.id || '');
// //       setMembershipName(user.name || '');
// //     }
// //   }, [user]);

// //   const banks = [
// //     { id: 'abl', name: 'Allied Bank Limited (ABL)' },
// //     { id: 'hbl', name: 'Habib Bank Limited (HBL)' },
// //     { id: 'easypaisa', name: 'Easypaisa' },
// //     { id: 'jazzcash', name: 'JazzCash' },
// //     { id: 'ubl', name: 'United Bank Limited (UBL)' },
// //     { id: 'mcb', name: 'MCB Bank' },
// //   ];

// //   const paymentModes = [
// //     { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
// //     { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
// //   ];

// //   const handleBankSelect = (bank) => {
// //     setSelectedBank(bank.name);
// //     setDropdownVisible(false);
// //   };

// //   const handlePaymentModeSelect = (mode) => {
// //     setSelectedPaymentMode(mode.id);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor="white" />

// //       {/* Notch Header */}
// //       <ImageBackground
// //         source={require('../assets/notch.jpg')}
// //         style={styles.notch}
// //         imageStyle={styles.notchImage}
// //       >
// //         <View style={styles.notchContent}>
// //           <TouchableOpacity
// //             style={styles.backButton}
// //             onPress={() => navigation.navigate('start')}
// //           >
// //             <Icon name="arrow-left" size={24} color="#000" />
// //           </TouchableOpacity>

// //           <Text style={styles.headerText}>Bill Payment</Text>

// //           <View style={styles.placeholder} />
// //         </View>
// //       </ImageBackground>

// //       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
// //         {/* User Information Section */}
// //         <View style={styles.section}>
// //           <Text style={styles.sectionTitle}>User Information</Text>

// //           <View style={styles.inputGroup}>
// //             <Text style={styles.label}>Membership Number</Text>
// //             <TextInput
// //               style={styles.input}
// //               value={membershipNumber}
// //               editable={false}
// //             />
// //           </View>

// //           <View style={styles.inputGroup}>
// //             <Text style={styles.label}>Membership name</Text>
// //             <TextInput
// //               style={styles.input}
// //               value={membershipName}
// //               editable={false}
// //             />
// //           </View>
// //         </View>

// //         {/* Bill Details Section */}
// //         <View style={styles.section}>
// //           <Text style={styles.sectionTitle}>Bill Details</Text>

// //           <View style={styles.inputGroup}>
// //             <Text style={styles.label}>Status</Text>
// //             <TextInput
// //               style={styles.input}
// //               value={status}
// //               onChangeText={setStatus}
// //               placeholder="Enter status"
// //               placeholderTextColor="#999"
// //             />
// //           </View>

// //           <View style={styles.inputGroup}>
// //             <Text style={styles.label}>Amount</Text>
// //             <TextInput
// //               style={styles.input}
// //               value={amount}
// //               onChangeText={setAmount}
// //               placeholder="Rs. 0"
// //               placeholderTextColor="#999"
// //               keyboardType="numeric"
// //             />
// //           </View>
// //         </View>

// //         {/* Payment Method Section */}
// //         <View style={styles.section}>
// //           <Text style={styles.sectionSubtitle}>
// //             Bill Payment Via <Text style={styles.billTopUp}>( Bill/Top up )</Text> Live
// //           </Text>
// //           <Text style={styles.selectChannel}>Select Bank</Text>

// //           {/* Bank Dropdown */}
// //           <TouchableOpacity
// //             style={styles.dropdown}
// //             onPress={() => setDropdownVisible(true)}
// //           >
// //             <Text style={selectedBank ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
// //               {selectedBank || 'Select a bank'}
// //             </Text>
// //             <Text style={styles.dropdownArrow}>▼</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {/* Payment Modes Section */}
// //         <View style={styles.paymentModesSection}>
// //           <Text style={styles.paymentModesTitle}>
// //             PAYMENT <Text style={styles.paymentModesTitleGold}>MODES</Text>
// //           </Text>

// //           <View style={styles.paymentGrid}>
// //             {paymentModes.map((mode) => (
// //               <TouchableOpacity
// //                 key={mode.id}
// //                 style={[
// //                   styles.paymentCard,
// //                   selectedPaymentMode === mode.id && styles.paymentCardSelected
// //                 ]}
// //                 onPress={() => handlePaymentModeSelect(mode)}
// //               >
// //                 {mode.type === 'image' ? (
// //                   <View style={styles.paymentImageContainer}>
// //                     <Image
// //                       source={mode.image}
// //                       style={styles.paymentImage}
// //                       resizeMode="contain"
// //                     />
// //                   </View>
// //                 ) : (
// //                   <View style={[styles.paymentIconContainer, { backgroundColor: mode.color }]}>
// //                     <Icon name={mode.icon} size={40} color="#fff" />
// //                   </View>
// //                 )}
// //                 <Text style={styles.paymentLabel}>{mode.label}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </View>

// //         {/* E-Payment Procedures Section */}
// //         <View style={styles.section}>
// //           <Text style={styles.proceduresTitle}>E - PAYMENT PROCEDURES</Text>
// //           <Text style={styles.proceduresSubtitle}>Bill Payment</Text>

// //           <View style={styles.proceduresList}>
// //             <Text style={styles.procedureItem}>
// //               • HBL eConnect holders can conveniently conduct payments via Credit Card or Debit Card. All you need to do is a simple log-in to your HBL app on your mobile phone and you can process your payment.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • HBL eConnect user need to add their dropdown menu after your Membership number and amount are selected. Pay and proceed with your payment.
// //             </Text>
// //             <Text style={styles.procedureItemHighlight}>
// //               BILL TOP UP
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • You can simply pay your bill using the 'Bill/Top Up' option available in your E-Sahulat or any Micro ATM.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • Navigate to the 'Bill/Top Up' option in your E-Sahulat App.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • Choose HBL Microfinance Bank Limited/NRSP/microfinance/1 bill payment, if both the above options are available.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • Add the company Code, your Membership Code, Phone number and amount.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • After entering the G. press enter. Your Membership name and CNIC will show up and proceed with your payment.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • The amount will be posted to any transaction account.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • It is payable in account without any discount.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • All e-Sahulat fee will be borne from your own bank account slip.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • The deadline for paying PG Bill is 28th of every month where an individual has not paid by the due date.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • Monthly payments will be processed based on the Membership end date. All member login portal at: www.alikhantraining.com
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • In case of E-Sahulat non-payment and Terminated members cannot access to gym or do not get access and facilities of the gym. If you have paid your payment but still did not have access to everyone Services Dues incomplete attendance please contact us by addressing a copy of your bill.
// //             </Text>
// //             <Text style={styles.procedureItem}>
// //               • Do not pay any extra amount. In case of any query, please reach out to us.
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Submit Button */}
// //         <TouchableOpacity style={styles.submitButton}>
// //           <Text style={styles.submitButtonText}>Submit Payment</Text>
// //         </TouchableOpacity>

// //         <View style={{ height: 30 }} />
// //       </ScrollView>

// //       {/* Dropdown Modal */}
// //       <Modal
// //         visible={dropdownVisible}
// //         transparent={true}
// //         animationType="fade"
// //         onRequestClose={() => setDropdownVisible(false)}
// //       >
// //         <TouchableOpacity
// //           style={styles.modalOverlay}
// //           activeOpacity={1}
// //           onPress={() => setDropdownVisible(false)}
// //         >
// //           <View style={styles.modalContent}>
// //             <Text style={styles.modalTitle}>Select Bank</Text>
// //             <ScrollView style={styles.bankList}>
// //               {banks.map((bank) => (
// //                 <TouchableOpacity
// //                   key={bank.id}
// //                   style={styles.bankItem}
// //                   onPress={() => handleBankSelect(bank)}
// //                 >
// //                   <Text style={styles.bankItemText}>{bank.name}</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>
// //             <TouchableOpacity
// //               style={styles.closeButton}
// //               onPress={() => setDropdownVisible(false)}
// //             >
// //               <Text style={styles.closeButtonText}>Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </TouchableOpacity>
// //       </Modal>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F9EFE6',
// //   },
// //   notch: {
// //     paddingTop: 50,
// //     paddingBottom: 20,
// //     paddingHorizontal: 20,
// //     borderBottomEndRadius: 30,
// //     borderBottomStartRadius: 30,
// //     overflow: 'hidden',
// //     minHeight: 120,
// //   },
// //   notchImage: {
// //     resizeMode: 'cover',
// //   },
// //   notchContent: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //   },
// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   backIcon: {
// //     fontSize: 36,
// //     color: '#000',
// //     fontWeight: 'bold',
// //     lineHeight: 36,
// //   },
// //   headerText: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     color: '#000',
// //     textAlign: 'center',
// //     flex: 1,
// //     lineHeight: 36,
// //   },
// //   placeholder: {
// //     width: 40,
// //   },
// //   content: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   section: {
// //     backgroundColor: '#FFF',
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 16,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 16,
// //   },
// //   sectionSubtitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 8,
// //   },
// //   billTopUp: {
// //     color: '#666',
// //     fontSize: 14,
// //   },
// //   selectChannel: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginBottom: 12,
// //     marginTop: 8,
// //   },
// //   inputGroup: {
// //     marginBottom: 16,
// //   },
// //   label: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 8,
// //   },
// //   input: {
// //     backgroundColor: '#F5F5F5',
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 16,
// //     color: '#333',
// //     borderWidth: 1,
// //     borderColor: '#E0E0E0',
// //   },
// //   dropdown: {
// //     backgroundColor: '#F5F5F5',
// //     borderRadius: 8,
// //     padding: 12,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E0E0E0',
// //   },
// //   dropdownTextPlaceholder: {
// //     fontSize: 16,
// //     color: '#999',
// //   },
// //   dropdownTextSelected: {
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   dropdownArrow: {
// //     fontSize: 12,
// //     color: '#666',
// //   },
// //   paymentModesSection: {
// //     backgroundColor: '#FFF',
// //     borderRadius: 12,
// //     padding: 20,
// //     marginBottom: 16,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   paymentModesTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#000',
// //     textAlign: 'center',
// //     marginBottom: 24,
// //     letterSpacing: 2,
// //   },
// //   paymentModesTitleGold: {
// //     color: '#C9A962',
// //   },
// //   paymentGrid: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     justifyContent: 'space-between',
// //   },
// //   paymentCard: {
// //     width: '48%',
// //     backgroundColor: '#FFF',
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 16,
// //     alignItems: 'center',
// //     borderWidth: 2,
// //     borderColor: '#C9A962',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.08,
// //     shadowRadius: 4,
// //     elevation: 2,
// //   },
// //   paymentCardSelected: {
// //     borderColor: '#00A651',
// //     backgroundColor: '#F0F8F4',
// //   },
// //   paymentIconContainer: {
// //     width: 100,
// //     height: 100,
// //     borderRadius: 50,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 12,
// //   },
// //   paymentIcon: {
// //     fontSize: 48,
// //   },
// //   paymentImageContainer: {
// //     width: 100,
// //     height: 100,
// //     borderRadius: 50,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 12,
// //     backgroundColor: '#F5F5F5',
// //     overflow: 'hidden',
// //   },
// //   paymentImage: {
// //     width: 100,
// //     height: 100,
// //   },
// //   paymentLabel: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#000',
// //     textAlign: 'center',
// //   },
// //   proceduresTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 12,
// //     textAlign: 'center',
// //   },
// //   proceduresSubtitle: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 16,
// //   },
// //   proceduresList: {
// //     paddingLeft: 4,
// //   },
// //   procedureItem: {
// //     fontSize: 14,
// //     color: '#555',
// //     lineHeight: 22,
// //     marginBottom: 12,
// //   },
// //   procedureItemHighlight: {
// //     fontSize: 15,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 12,
// //     marginTop: 4,
// //   },
// //   submitButton: {
// //     backgroundColor: '#00A651',
// //     borderRadius: 12,
// //     padding: 16,
// //     alignItems: 'center',
// //     marginTop: 8,
// //   },
// //   submitButtonText: {
// //     color: '#FFF',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   modalContent: {
// //     backgroundColor: '#FFF',
// //     borderRadius: 12,
// //     width: '85%',
// //     maxHeight: '70%',
// //     padding: 20,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 16,
// //     textAlign: 'center',
// //   },
// //   bankList: {
// //     maxHeight: 300,
// //   },
// //   bankItem: {
// //     padding: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#F0F0F0',
// //   },
// //   bankItemText: {
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   closeButton: {
// //     backgroundColor: '#007AFF',
// //     borderRadius: 8,
// //     padding: 12,
// //     marginTop: 16,
// //     alignItems: 'center',
// //   },
// //   closeButtonText: {
// //     color: '#FFF',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// // });

// // export default BillPaymentScreen;
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   StatusBar,
//   Linking,
//   Platform,
//   ImageBackground,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getBaseUrl } from '../config/apis'; // If you have this, otherwise use your API_BASE_URL

// const API_BASE_URL = getBaseUrl ? getBaseUrl() : 'http://localhost:3000';

// // API functions
// const storeAuthData = async (tokens, userData) => {
//   try {
//     await AsyncStorage.setItem('access_token', tokens.access_token);
//     await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
//     await AsyncStorage.setItem('user_data', JSON.stringify(userData));
//     console.log('✅ Auth data stored');
//   } catch (error) {
//     console.error('Error storing auth data:', error);
//   }
// };

// const getAuthToken = async () => {
//   try {
//     return await AsyncStorage.getItem('access_token');
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// const getUserData = async () => {
//   try {
//     const userData = await AsyncStorage.getItem('user_data');
//     return userData ? JSON.parse(userData) : null;
//   } catch (error) {
//     console.error('Error getting user data:', error);
//     return null;
//   }
// };

// const getMembershipNumberFromUserData = (userData) => {
//   // Try different possible field names for membership number
//   return userData?.Membership_No ||
//     userData?.membershipNo ||
//     userData?.membershipNumber ||
//     userData?.memberId ||
//     userData?.id ||
//     '';
// };

// const Bills = ({ navigation }) => {
//   const [membershipNumber, setMembershipNumber] = useState('');
//   const [membershipName, setMembershipName] = useState('');
//   const [memberData, setMemberData] = useState(null);
//   const [selectedMethod, setSelectedMethod] = useState('');
//   const [selectedBank, setSelectedBank] = useState('');
//   const [showBankDropdown, setShowBankDropdown] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userRole, setUserRole] = useState('');
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Check user role and initialize
//   const initializeApp = async () => {
//     try {
//       setLoading(true);
//       const userData = await getUserData();

//       if (!userData) {
//         Alert.alert('Error', 'Please login first');
//         navigation.navigate('Login');
//         return;
//       }

//       // Check if user is admin based on role field
//       const role = userData?.role || userData?.Role || 'MEMBER';
//       setUserRole(role);
//       const isUserAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'admin';
//       setIsAdmin(isUserAdmin);

//       if (isUserAdmin) {
//         // For admin, don't auto-fetch member data
//         setLoading(false);
//       } else {
//         // For member, fetch their own data
//         fetchMemberData(userData);
//       }
//     } catch (error) {
//       console.error('Error initializing app:', error);
//       Alert.alert('Error', 'Failed to initialize app');
//       setLoading(false);
//     }
//   };

//   // Fetch member data
//   const fetchMemberData = async (userData) => {
//     try {
//       const token = await getAuthToken();
//       const memberId = getMembershipNumberFromUserData(userData);

//       if (!memberId) {
//         Alert.alert('Error', 'No membership number found');
//         setLoading(false);
//         return;
//       }

//       console.log('🔍 Fetching data for membership:', memberId);

//       const response = await fetch(
//         `${API_BASE_URL}/member/get/members?membershipNo=${memberId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         if (data.data && data.data.length > 0) {
//           // Find the EXACT match for the membership number
//           const exactMember = data.data.find(
//             m => m.Membership_No === memberId ||
//               m.membershipNo === memberId ||
//               String(m.Membership_No) === String(memberId)
//           );

//           // If exact match found, use it. Otherwise fall back to first result
//           const member = exactMember || data.data[0];

//           console.log('✅ Found member:', member.Name, 'with ID:', member.Membership_No);

//           setMemberData(member);
//           setMembershipNumber(member.Membership_No);
//           setMembershipName(member.Name);

//           // Fetch additional data
//           fetchMemberVouchers(member.Membership_No);
//           fetchMemberBookings(member.Membership_No);
//         } else {
//           Alert.alert('Error', 'Member data not found');
//         }
//       } else {
//         Alert.alert('Error', 'Failed to fetch member data');
//       }
//     } catch (error) {
//       console.error('Error fetching member data:', error);
//       Alert.alert('Error', 'Failed to load member data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Search members (admin only)
//   const searchMembers = async () => {
//     if (!searchTerm.trim()) {
//       Alert.alert('Error', 'Please enter search term');
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await getAuthToken();

//       const response = await fetch(
//         `${API_BASE_URL}/member/get/members?search=${encodeURIComponent(searchTerm)}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         if (data.data && data.data.length > 0) {
//           const member = data.data[0];
//           setMemberData(member);
//           setMembershipNumber(member.Membership_No);
//           setMembershipName(member.Name);
//           setSearchTerm('');

//           // Fetch additional data for the selected member
//           fetchMemberVouchers(member.Membership_No);
//           fetchMemberBookings(member.Membership_No);
//         } else {
//           Alert.alert('Not Found', 'No member found with that search term');
//         }
//       } else {
//         Alert.alert('Error', 'Failed to search members');
//       }
//     } catch (error) {
//       console.error('Error searching members:', error);
//       Alert.alert('Error', 'Failed to search members');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMemberVouchers = async (membershipNo) => {
//     if (!membershipNo) return;

//     try {
//       const token = await getAuthToken();
//       const response = await fetch(
//         `${API_BASE_URL}/payment/member/vouchers?membershipNo=${membershipNo}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const vouchers = await response.json();
//         console.log('Vouchers:', vouchers);
//       }
//     } catch (error) {
//       console.error('Error fetching vouchers:', error);
//     }
//   };

//   const fetchMemberBookings = async (membershipNo) => {
//     if (!membershipNo) return;

//     try {
//       const token = await getAuthToken();
//       const response = await fetch(
//         `${API_BASE_URL}/booking/member/bookings?membershipNo=${membershipNo}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const bookings = await response.json();
//         console.log('Bookings:', bookings);
//       }
//     } catch (error) {
//       console.error('Error fetching bookings:', error);
//     }
//   };

//   useEffect(() => {
//     initializeApp();
//   }, []);

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'PAID':
//       case 'CONFIRMED':
//       case 'ACTIVE':
//         return <Text style={styles.statusBadgePaid}>{status}</Text>;
//       case 'HALF_PAID':
//       case 'PENDING':
//         return <Text style={styles.statusBadgeHalfPaid}>{status}</Text>;
//       case 'UNPAID':
//       case 'INACTIVE':
//         return <Text style={styles.statusBadgeUnpaid}>{status}</Text>;
//       default:
//         return <Text style={styles.statusBadge}>{status}</Text>;
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

//       {/* 🔹 Notch Header with Background Image */}
//       <ImageBackground
//         source={require('../assets/notch.jpg')}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchContent}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Icon name="arrow-left" size={24} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.headerText}>Bill Payment</Text>

//           <View style={styles.placeholder} />
//         </View>
//       </ImageBackground>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Role Badge */}
//         <View style={styles.roleBadgeContainer}>
//           <Text style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.memberBadge]}>
//             {isAdmin ? 'ADMIN' : 'MEMBER'}
//           </Text>
//         </View>

//         {/* Search Section - Only for Admin */}
//         {isAdmin && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Search Member</Text>
//             <View style={styles.searchContainer}>
//               <TextInput
//                 style={styles.searchInput}
//                 value={searchTerm}
//                 onChangeText={setSearchTerm}
//                 placeholder="Search by name or membership number"
//                 placeholderTextColor="#999"
//               />
//               <TouchableOpacity
//                 style={styles.searchButton}
//                 onPress={searchMembers}
//               >
//                 <Text style={styles.searchButtonText}>Search</Text>
//               </TouchableOpacity>
//             </View>
//             {searchTerm && !memberData && (
//               <Text style={styles.searchHint}>
//                 Enter a member's name or membership number to search
//               </Text>
//             )}
//           </View>
//         )}

//         {/* User Information Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>
//             {isAdmin ? 'Member Information' : 'Your Information'}
//           </Text>

//           {(!isAdmin || (isAdmin && memberData)) ? (
//             <>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Membership Number</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={membershipNumber}
//                   editable={false}
//                   selectTextOnFocus={false}
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Member Name</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={membershipName}
//                   editable={false}
//                   selectTextOnFocus={false}
//                 />
//               </View>

//               {memberData && (
//                 <View style={styles.memberDetailsContainer}>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Current Balance:</Text>
//                     <Text style={[
//                       styles.detailValue,
//                       memberData.Balance < 0 && styles.negativeBalance
//                     ]}>
//                       PKR {memberData.Balance?.toLocaleString() || 0}
//                     </Text>
//                   </View>

//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Account Status:</Text>
//                     {getStatusBadge(memberData.Status)}
//                   </View>

//                   {memberData.totalBookings !== undefined && (
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Total Bookings:</Text>
//                       <Text style={styles.detailValue}>{memberData.totalBookings || 0}</Text>
//                     </View>
//                   )}
//                 </View>
//               )}
//             </>
//           ) : isAdmin ? (
//             <View style={styles.noMemberContainer}>
//               <Text style={styles.noMemberText}>
//                 Search for a member to view their information
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.noMemberContainer}>
//               <Text style={styles.noMemberText}>
//                 Unable to load member information
//               </Text>
//               <TouchableOpacity
//                 style={styles.retryButton}
//                 onPress={initializeApp}
//               >
//                 <Text style={styles.retryButtonText}>Retry</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>

//         {/* Payment Section - Only for Members */}
//         {!isAdmin && memberData && (
//           <>
//             {/* Bill Payment Via Section with Dropdown */}
//             <View style={styles.section}>
//               <Text style={styles.sectionSubtitle}>
//                 Bill Payment Via <Text style={styles.billTopUp}>( 1 Bill/Top up/1 Link )</Text>
//               </Text>

//               {/* Bank Dropdown */}
//               <View style={styles.dropdownContainer}>
//                 <TouchableOpacity
//                   style={styles.dropdown}
//                   onPress={() => setShowBankDropdown(!showBankDropdown)}
//                 >
//                   <Text style={styles.dropdownText}>
//                     {selectedBank || 'Select Bank'}
//                   </Text>
//                   <Text style={styles.dropdownArrow}>▼</Text>
//                 </TouchableOpacity>

//                 {/* Dropdown List */}
//                 {showBankDropdown && (
//                   <View style={styles.dropdownList}>
//                     <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
//                       {paymentApps.map((bank, index) => (
//                         <TouchableOpacity
//                           key={index}
//                           style={styles.dropdownItem}
//                           onPress={() => handleBankSelect(bank)}
//                         >
//                           <Text style={styles.dropdownItemText}>{bank.name}</Text>
//                         </TouchableOpacity>
//                       ))}
//                     </ScrollView>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Payment Modes Section */}
//             <View style={styles.paymentModesSection}>
//               <Text style={styles.paymentModesTitle}>
//                 PAYMENT <Text style={styles.paymentModesTitleGold}>MODES</Text>
//               </Text>

//               <View style={styles.paymentGrid}>
//                 {paymentModes.map((mode) => (
//                   <TouchableOpacity
//                     key={mode.id}
//                     style={[
//                       styles.paymentCard,
//                       selectedMethod === mode.id && styles.paymentCardSelected
//                     ]}
//                     onPress={() => setSelectedMethod(mode.id)}
//                   >
//                     {mode.type === 'image' ? (
//                       <View style={styles.paymentImageContainer}>
//                         <Image
//                           source={mode.image}
//                           style={styles.paymentImage}
//                           resizeMode="contain"
//                         />
//                       </View>
//                     ) : (
//                       <View style={[styles.paymentIconContainer, { backgroundColor: mode.color }]}>
//                         <Icon name={mode.icon} size={40} color="#fff" />
//                       </View>
//                     )}
//                     <Text style={styles.paymentLabel}>{mode.label}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Important Notice Section */}
//             <View style={styles.section}>
//               <Text style={styles.noticeTitle}>Important Information</Text>
//               <View style={styles.noticeBox}>
//                 <Text style={styles.noticeItem}>
//                   • Please note that a service charge of Rs. 35/- will be applied to any transaction amount.
//                 </Text>
//                 <Text style={styles.noticeItem}>
//                   • It's a hassle-free way to pay your bill conveniently from your own bank account app.
//                 </Text>
//               </View>
//             </View>

//             {/* E-Payment Procedures Section */}
//             <View style={styles.section}>
//               <Text style={styles.proceduresTitle}>E - PAYMENT PROCEDURES</Text>
//               <Text style={styles.proceduresSubtitle}>Bill Payment</Text>

//               <View style={styles.proceduresList}>
//                 <Text style={styles.procedureItem}>
//                   • HBL eConnect holders can conveniently conduct payments via Credit Card or Debit Card. All you need to do is a simple log-in to your HBL app on your mobile phone and you can process your payment.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • HBL eConnect user need to add their dropdown menu after your Membership number and amount are selected. Pay and proceed with your payment.
//                 </Text>
//                 <Text style={styles.procedureItemHighlight}>
//                   BILL TOP UP
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • You can simply pay your bill using the 'Bill/Top Up' option available in your E-Sahulat or any Micro ATM.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • Navigate to the 'Bill/Top Up' option in your E-Sahulat App.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • Choose HBL Microfinance Bank Limited/NRSP/microfinance/1 bill payment, if both the above options are available.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • Add the company Code, your Membership Code, Phone number and amount.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • After entering the G. press enter. Your Membership name and CNIC will show up and proceed with your payment.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • The amount will be posted to any transaction account.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • It is payable in account without any discount.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • All e-Sahulat fee will be borne from your own bank account slip.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • The deadline for paying PG Bill is 28th of every month where an individual has not paid by the due date.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • Monthly payments will be processed based on the Membership end date. All member login portal at: www.alikhantraining.com
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • In case of E-Sahulat non-payment and Terminated members cannot access to gym or do not get access and facilities of the gym. If you have paid your payment but still did not have access to everyone Services Dues incomplete attendance please contact us by addressing a copy of your bill.
//                 </Text>
//                 <Text style={styles.procedureItem}>
//                   • Do not pay any extra amount. In case of any query, please reach out to us.
//                 </Text>
//               </View>
//             </View>
//           </>
//         )}

//         {/* Admin Message - Only for admin when member data is loaded */}
//         {isAdmin && memberData && (
//           <View style={styles.section}>
//             <Text style={styles.adminMessage}>
//               Payment section is only available to members. As an admin, you can only view member information.
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// // Add payment methods and apps data (these are only used for members)
// const paymentModes = [
//   { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
//   { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
// ];

// const paymentApps = [
//   {
//     name: 'ABL',
//     fullName: 'Allied Bank',
//     playStore: 'https://play.google.com/store/apps/details?id=com.ofss.digx.mobile.android.allied&hl=en',
//     appStore: 'https://apps.apple.com/us/app/myabl-wallet/id1455479217'
//   },
//   {
//     name: 'Alfalah',
//     fullName: 'Bank Alfalah – ALFA',
//     playStore: 'https://play.google.com/store/apps/details?id=com.base.bankalfalah&hl=en',
//     appStore: 'https://apps.apple.com/pk/app/alfa-by-bank-alfalah/id1454449117'
//   },
//   // ... (rest of payment apps array remains the same)
//   {
//     name: 'SadaPay',
//     fullName: 'SadaPay',
//     playStore: 'https://play.google.com/store/apps/details?id=com.sadapay.app&hl=en-US',
//     appStore: 'https://apps.apple.com/us/app/sadapay-money-made-simple/id1543848524'
//   },
// ];

// const handleOpenApp = (app) => {
//   const link = Platform.OS === 'ios' ? app.appStore : app.playStore;
//   Linking.openURL(link).catch(err => {
//     console.error('Failed to open link:', err);
//     Alert.alert('Error', 'Could not open app store');
//   });
// };

// const handleBankSelect = (bank) => {
//   // This function is only used in member context
//   // We'll define this inside the component but it's only called for members
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9EFE6',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9EFE6',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#333',
//   },
//   notch: {
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomEndRadius: 30,
//     borderBottomStartRadius: 30,
//     overflow: 'hidden',
//     minHeight: 120,
//   },
//   notchImage: {
//     resizeMode: 'cover',
//   },
//   notchContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: {
//     fontSize: 36,
//     color: '#000',
//     fontWeight: 'bold',
//     lineHeight: 36,
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
//     lineHeight: 36,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
//   },
//   placeholder: {
//     width: 40,
//   },
//   refreshButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   refreshIcon: {
//     fontSize: 24,
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   // Role Badge Styles
//   roleBadgeContainer: {
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   roleBadge: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     paddingHorizontal: 20,
//     paddingVertical: 6,
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   adminBadge: {
//     backgroundColor: '#FF6B6B',
//     color: '#fff',
//   },
//   memberBadge: {
//     backgroundColor: '#4CAF50',
//     color: '#fff',
//   },
//   // Section Styles
//   section: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 16,
//   },
//   sectionSubtitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   billTopUp: {
//     color: '#666',
//     fontSize: 14,
//   },
//   selectChannel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//     marginTop: 8,
//   },
//   // Search Styles (Admin)
//   searchContainer: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#333',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   searchButton: {
//     backgroundColor: '#C9A962',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     justifyContent: 'center',
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   searchHint: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
//   // Input Styles
//   inputGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#333',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   // Member Details Styles
//   memberDetailsContainer: {
//     backgroundColor: '#FFF9F0',
//     borderRadius: 10,
//     padding: 16,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#E8DDD0',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0E8E0',
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#333',
//   },
//   negativeBalance: {
//     color: '#f44336',
//   },
//   // Status Badge Styles
//   statusBadge: {
//     fontSize: 12,
//     fontWeight: '600',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     backgroundColor: '#e0e0e0',
//     color: '#333',
//     overflow: 'hidden',
//   },
//   statusBadgePaid: {
//     fontSize: 12,
//     fontWeight: '600',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     overflow: 'hidden',
//   },
//   statusBadgeHalfPaid: {
//     fontSize: 12,
//     fontWeight: '600',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     backgroundColor: '#FF9800',
//     color: 'white',
//     overflow: 'hidden',
//   },
//   statusBadgeUnpaid: {
//     fontSize: 12,
//     fontWeight: '600',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     backgroundColor: '#f44336',
//     color: 'white',
//     overflow: 'hidden',
//   },
//   // No Member Styles
//   noMemberContainer: {
//     alignItems: 'center',
//     paddingVertical: 30,
//   },
//   noMemberText: {
//     fontSize: 15,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   retryButton: {
//     backgroundColor: '#C9A962',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   // Dropdown Styles
//   dropdown: {
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   dropdownTextPlaceholder: {
//     fontSize: 16,
//     color: '#999',
//   },
//   dropdownTextSelected: {
//     fontSize: 16,
//     color: '#333',
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   dropdownArrow: {
//     fontSize: 12,
//     color: '#666',
//   },
//   dropdownContainer: {
//     position: 'relative',
//     zIndex: 1000,
//   },
//   dropdownList: {
//     position: 'absolute',
//     top: 50,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     maxHeight: 300,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     zIndex: 1001,
//   },
//   dropdownScrollView: {
//     maxHeight: 300,
//   },
//   dropdownItem: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   dropdownItemText: {
//     fontSize: 15,
//     color: '#333',
//   },
//   // Payment Modes Styles
//   paymentModesSection: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   paymentModesTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     marginBottom: 24,
//     letterSpacing: 2,
//   },
//   paymentModesTitleGold: {
//     color: '#C9A962',
//   },
//   paymentGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   paymentCard: {
//     width: '48%',
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#C9A962',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   paymentCardSelected: {
//     borderColor: '#00A651',
//     backgroundColor: '#F0F8F4',
//   },
//   paymentMethod: {
//     width: '48%',
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#C9A962',
//   },
//   paymentMethodSelected: {
//     borderColor: '#00A651',
//     backgroundColor: '#F0F8F4',
//   },
//   paymentIconContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   paymentIcon: {
//     fontSize: 48,
//   },
//   paymentImageContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//     backgroundColor: '#F5F5F5',
//     overflow: 'hidden',
//   },
//   paymentImage: {
//     width: 100,
//     height: 100,
//   },
//   paymentLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//     textAlign: 'center',
//   },
//   iconCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#4CAF50',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   icon: {
//     fontSize: 36,
//   },
//   methodLabel: {
//     fontSize: 13,
//     color: '#333',
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   // Procedures Styles
//   proceduresTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   proceduresSubtitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 16,
//   },
//   proceduresList: {
//     paddingLeft: 4,
//   },
//   procedureItem: {
//     fontSize: 14,
//     color: '#555',
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   procedureItemHighlight: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//     marginTop: 4,
//   },
//   // Button Styles
//   submitButton: {
//     backgroundColor: '#00A651',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   submitButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   downloadButton: {
//     backgroundColor: '#C9A962',
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   downloadButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   downloadNote: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   // Important Notice Styles
//   noticeTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 12,
//   },
//   noticeBox: {
//     backgroundColor: '#FFF9E6',
//     borderLeftWidth: 4,
//     borderLeftColor: '#FFC107',
//     padding: 12,
//     borderRadius: 6,
//   },
//   noticeItem: {
//     fontSize: 13,
//     color: '#555',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     width: '85%',
//     maxHeight: '70%',
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   bankList: {
//     maxHeight: 300,
//   },
//   bankItem: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   bankItemText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   closeButton: {
//     backgroundColor: '#C9A962',
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Admin Message
//   adminMessage: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     fontStyle: 'italic',
//     paddingVertical: 10,
//   },
// });

// export default Bills;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking,
  Platform,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl } from '../config/apis'; // If you have this, otherwise use your API_BASE_URL

const API_BASE_URL = getBaseUrl ? getBaseUrl() : 'http://193.203.169.122:8080/api';

// API functions
const storeAuthData = async (tokens, userData) => {
  try {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    console.log('✅ Auth data stored');
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

const getMembershipNumberFromUserData = (userData) => {
  // Try different possible field names for membership number
  return userData?.Membership_No ||
    userData?.membershipNo ||
    userData?.membershipNumber ||
    userData?.memberId ||
    userData?.id ||
    '';
};

const Bills = ({ navigation }) => {
  const [membershipNumber, setMembershipNumber] = useState('');
  const [membershipName, setMembershipName] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Payment apps for bank dropdown (for 1 Bill payment)
  const paymentApps = [
    { name: 'Easypaisa' },
    { name: 'JazzCash' },
    { name: 'HBL Mobile' },
    { name: 'Meezan Bank' },
    { name: 'UBL Digital' },
    { name: 'Bank Alfalah' },
    { name: 'MCB Mobile' },
    { name: 'Allied Bank' },
  ];

  // Payment modes - Only Cash and Kuickpay
  const paymentModes = [
    { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
    { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
  ];

  // Handle bank selection from dropdown
  const handleBankSelect = (bank) => {
    setSelectedBank(bank.name);
    setShowBankDropdown(false);
  };

  // Check user role and initialize
  const initializeApp = async () => {
    try {
      setLoading(true);
      const userData = await getUserData();

      if (!userData) {
        Alert.alert('Error', 'Please login first');
        navigation.navigate('Login');
        return;
      }

      // Check if user is admin based on role field
      const role = userData?.role || userData?.Role || 'MEMBER';
      setUserRole(role);
      const isUserAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'admin';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        // For admin, don't auto-fetch member data
        setLoading(false);
      } else {
        // For member, fetch their own data
        fetchMemberData(userData);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize app');
      setLoading(false);
    }
  };

  // Fetch member data
  const fetchMemberData = async (userData) => {
    try {
      const token = await getAuthToken();
      const memberId = getMembershipNumberFromUserData(userData);

      if (!memberId) {
        Alert.alert('Error', 'No membership number found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching data for membership:', memberId);

      const response = await fetch(
        `${API_BASE_URL}/member/get/members?membershipNo=${memberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          // Find the EXACT match for the membership number
          const exactMember = data.data.find(
            m => m.Membership_No === memberId ||
              m.membershipNo === memberId ||
              String(m.Membership_No) === String(memberId)
          );

          // If exact match found, use it. Otherwise fall back to first result
          const member = exactMember || data.data[0];

          console.log('✅ Found member:', member.Name, 'with ID:', member.Membership_No);

          setMemberData(member);
          setMembershipNumber(member.Membership_No);
          setMembershipName(member.Name);

          // Fetch additional data
          fetchMemberVouchers(member.Membership_No);
          fetchMemberBookings(member.Membership_No);
        } else {
          Alert.alert('Error', 'Member data not found');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch member data');
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      Alert.alert('Error', 'Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  // Search members (admin only)
  const searchMembers = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter search term');
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/member/get/members?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const member = data.data[0];
          setMemberData(member);
          setMembershipNumber(member.Membership_No);
          setMembershipName(member.Name);
          setSearchTerm('');

          // Fetch additional data for the selected member
          fetchMemberVouchers(member.Membership_No);
          fetchMemberBookings(member.Membership_No);
        } else {
          Alert.alert('Not Found', 'No member found with that search term');
        }
      } else {
        Alert.alert('Error', 'Failed to search members');
      }
    } catch (error) {
      console.error('Error searching members:', error);
      Alert.alert('Error', 'Failed to search members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberVouchers = async (membershipNo) => {
    if (!membershipNo) return;

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/payment/member/vouchers?membershipNo=${membershipNo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const vouchers = await response.json();
        console.log('Vouchers:', vouchers);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const fetchMemberBookings = async (membershipNo) => {
    if (!membershipNo) return;

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/booking/member/bookings?membershipNo=${membershipNo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const bookings = await response.json();
        console.log('Bookings:', bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'CONFIRMED':
      case 'ACTIVE':
        return <Text style={styles.statusBadgePaid}>{status}</Text>;
      case 'HALF_PAID':
      case 'PENDING':
        return <Text style={styles.statusBadgeHalfPaid}>{status}</Text>;
      case 'UNPAID':
      case 'INACTIVE':
        return <Text style={styles.statusBadgeUnpaid}>{status}</Text>;
      default:
        return <Text style={styles.statusBadge}>{status}</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* 🔹 Notch Header with Background Image */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Bill Payment</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={initializeApp}
          >
            <Icon name="refresh" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Role Badge */}
        <View style={styles.roleBadgeContainer}>
          <Text style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.memberBadge]}>
            {isAdmin ? 'Super-Admin' : 'MEMBER'}
          </Text>
        </View>

        {/* Search Section - Only for Admin */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Member</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search by name or membership number"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchMembers}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
            {searchTerm && !memberData && (
              <Text style={styles.searchHint}>
                Enter a member's name or membership number to search
              </Text>
            )}
          </View>
        )}

        {/* User Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAdmin ? 'Member Information' : 'Your Information'}
          </Text>

          {(!isAdmin || (isAdmin && memberData)) ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Membership Number</Text>
                <TextInput
                  style={styles.input}
                  value={membershipNumber}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Member Name</Text>
                <TextInput
                  style={styles.input}
                  value={membershipName}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>

              {memberData && (
                <View style={styles.memberDetailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Balance:</Text>
                    <Text style={[
                      styles.detailValue,
                      memberData.Balance < 0 && styles.negativeBalance
                    ]}>
                      PKR {memberData.Balance?.toLocaleString() || 0}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Status:</Text>
                    {getStatusBadge(memberData.Status)}
                  </View>

                  {memberData.totalBookings !== undefined && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Bookings:</Text>
                      <Text style={styles.detailValue}>{memberData.totalBookings || 0}</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          ) : isAdmin ? (
            <View style={styles.noMemberContainer}>
              <Text style={styles.noMemberText}>
                Search for a member to view their information
              </Text>
            </View>
          ) : (
            <View style={styles.noMemberContainer}>
              <Text style={styles.noMemberText}>
                Unable to load member information
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeApp}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Section - Only for Members */}
        {!isAdmin && memberData && (
          <>
            {/* Bill Payment Via Section with Dropdown */}
            <View style={[styles.section, { zIndex: 1000 }]}>
              <Text style={styles.sectionSubtitle}>
                Bill Payment Via <Text style={styles.billTopUp}>( 1 Bill/Top up/1 Link )</Text>
              </Text>

              {/* Bank Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowBankDropdown(!showBankDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedBank || 'Select Bank'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {/* Dropdown List */}
                {showBankDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                      {paymentApps.map((bank, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleBankSelect(bank)}
                        >
                          <Text style={styles.dropdownItemText}>{bank.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Payment Modes Section */}
            <View style={styles.paymentModesSection}>
              <Text style={styles.paymentModesTitle}>
                PAYMENT <Text style={styles.paymentModesTitleGold}>MODES</Text>
              </Text>

              <View style={styles.paymentGrid}>
                {paymentModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.paymentCard,
                      selectedMethod === mode.id && styles.paymentCardSelected
                    ]}
                    onPress={() => setSelectedMethod(mode.id)}
                  >
                    {mode.type === 'image' ? (
                      <View style={styles.paymentImageContainer}>
                        <Image
                          source={mode.image}
                          style={styles.paymentImage}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View style={[styles.paymentIconContainer, { backgroundColor: mode.color }]}>
                        <Icon name={mode.icon} size={40} color="#fff" />
                      </View>
                    )}
                    <Text style={styles.paymentLabel}>{mode.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Important Notice Section */}
            <View style={styles.section}>
              <Text style={styles.noticeTitle}>Important Information</Text>
              <View style={styles.noticeBox}>
                <Text style={styles.noticeItem}>
                  • Please note that a service charge of Rs. 35/- will be applied to any transaction amount.
                </Text>
                <Text style={styles.noticeItem}>
                  • It's a hassle-free way to pay your bill conveniently from your own bank account app.
                </Text>
              </View>
            </View>

            {/* E-Payment Procedures Section */}
            <View style={styles.section}>
              <Text style={styles.proceduresTitle}>E - PAYMENT PROCEDURES</Text>
              <Text style={styles.proceduresSubtitle}>Bill Payment</Text>

              <View style={styles.proceduresList}>
                <Text style={styles.procedureItem}>
                  • HBL eConnect holders can conveniently conduct payments via Credit Card or Debit Card. All you need to do is a simple log-in to your HBL app on your mobile phone and you can process your payment.
                </Text>
                <Text style={styles.procedureItem}>
                  • HBL eConnect user need to add their dropdown menu after your Membership number and amount are selected. Pay and proceed with your payment.
                </Text>
                <Text style={styles.procedureItemHighlight}>
                  BILL TOP UP
                </Text>
                <Text style={styles.procedureItem}>
                  • You can simply pay your bill using the 'Bill/Top Up' option available in your E-Sahulat or any Micro ATM.
                </Text>
                <Text style={styles.procedureItem}>
                  • Navigate to the 'Bill/Top Up' option in your E-Sahulat App.
                </Text>
                <Text style={styles.procedureItem}>
                  • Choose HBL Microfinance Bank Limited/NRSP/microfinance/1 bill payment, if both the above options are available.
                </Text>
                <Text style={styles.procedureItem}>
                  • Add the company Code, your Membership Code, Phone number and amount.
                </Text>
                <Text style={styles.procedureItem}>
                  • After entering the G. press enter. Your Membership name and CNIC will show up and proceed with your payment.
                </Text>
                <Text style={styles.procedureItem}>
                  • The amount will be posted to any transaction account.
                </Text>
                <Text style={styles.procedureItem}>
                  • It is payable in account without any discount.
                </Text>
                <Text style={styles.procedureItem}>
                  • All e-Sahulat fee will be borne from your own bank account slip.
                </Text>
                <Text style={styles.procedureItem}>
                  • The deadline for paying PG Bill is 28th of every month where an individual has not paid by the due date.
                </Text>
                <Text style={styles.procedureItem}>
                  • Monthly payments will be processed based on the Membership end date. All member login portal at: www.alikhantraining.com
                </Text>
                <Text style={styles.procedureItem}>
                  • In case of E-Sahulat non-payment and Terminated members cannot access to gym or do not get access and facilities of the gym. If you have paid your payment but still did not have access to everyone Services Dues incomplete attendance please contact us by addressing a copy of your bill.
                </Text>
                <Text style={styles.procedureItem}>
                  • Do not pay any extra amount. In case of any query, please reach out to us.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Admin Message - Only for admin when member data is loaded */}
        {isAdmin && memberData && (
          <View style={styles.section}>
            <Text style={styles.adminMessage}>
              Payment section is only available to members. As an admin, you can only view member information.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Payment modes data (these are only used for members)
const paymentModes = [
  { id: 'cash', label: 'Cash Payment', icon: 'cash', color: '#00A651', type: 'icon' },
  { id: 'kuickpay', label: 'Kuickpay', image: require('../assets/kp.png'), type: 'image' },
];

const handleBankSelect = (bank) => {
  // This function is only used in member context
  // We'll define this inside the component but it's only called for members
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFE6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  notch: {
    paddingTop: 16,
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
    marginTop: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 36,
    color: '#000',
    fontWeight: 'bold',
    lineHeight: 36,
  },
  headerText: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
    lineHeight: 36,
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
  refreshButton: {
    marginTop: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Role Badge Styles
  roleBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  adminBadge: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
  },
  memberBadge: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  // Section Styles
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  billTopUp: {
    color: '#666',
    fontSize: 14,
  },
  selectChannel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  // Search Styles (Admin)
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchButton: {
    backgroundColor: '#C9A962',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  searchHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Member Details Styles
  memberDetailsContainer: {
    backgroundColor: '#FFF9F0',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8E0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  negativeBalance: {
    color: '#f44336',
  },
  // Status Badge Styles
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    color: '#333',
    overflow: 'hidden',
  },
  statusBadgePaid: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    color: 'white',
    overflow: 'hidden',
  },
  statusBadgeHalfPaid: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    color: 'white',
    overflow: 'hidden',
  },
  statusBadgeUnpaid: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#f44336',
    color: 'white',
    overflow: 'hidden',
  },
  // No Member Styles
  noMemberContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noMemberText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#C9A962',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Dropdown Styles
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  // Payment Modes Styles
  paymentModesSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentModesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  paymentModesTitleGold: {
    color: '#C9A962',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C9A962',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#00A651',
    backgroundColor: '#F0F8F4',
  },
  paymentMethod: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C9A962',
  },
  paymentMethodSelected: {
    borderColor: '#00A651',
    backgroundColor: '#F0F8F4',
  },
  paymentIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIcon: {
    fontSize: 48,
  },
  paymentImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  paymentImage: {
    width: 100,
    height: 100,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 36,
  },
  methodLabel: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Procedures Styles
  proceduresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  proceduresSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  proceduresList: {
    paddingLeft: 4,
  },
  procedureItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  procedureItemHighlight: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 4,
  },
  // Button Styles
  submitButton: {
    backgroundColor: '#00A651',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#C9A962',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Important Notice Styles
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noticeBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    borderRadius: 6,
  },
  noticeItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  bankList: {
    maxHeight: 300,
  },
  bankItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bankItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#C9A962',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Admin Message
  adminMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});

export default Bills;