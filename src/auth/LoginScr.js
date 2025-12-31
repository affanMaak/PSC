
// // screens/LoginScr.js
// import React, { useState } from 'react';
// import { 
//   ImageBackground, 
//   Image, 
//   StyleSheet, 
//   SafeAreaView, 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   KeyboardAvoidingView, 
//   Platform, 
//   ScrollView,
//   Alert,
//   ActivityIndicator 
// } from 'react-native';
// import axios from 'axios';
// import { storeAuthData, getBaseUrl } from '../../config/apis';
// import { useAuth } from './contexts/AuthContext';

// const background = require('../../assets/bg.jpeg');
// const logo = require('../../assets/logo.jpeg');

// // Function to decode JWT token
// const decodeJWT = (token) => {
//   try {
//     const base64Url = token.split('.')[1];
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map(function(c) {
//           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         })
//         .join('')
//     );
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error('Error decoding JWT:', error);
//     return null;
//   }
// };

// const LoginScr = ({ navigation }) => {
//   const { login } = useAuth();
//   const [mode, setMode] = useState('member');
//   const [memberId, setMemberId] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const BASE_URL = `${getBaseUrl()}/auth`;

//   // === MEMBER LOGIN ===
//   const handleSendOTP = async () => {
//     if (!memberId) return Alert.alert('Error', 'Please enter your Member ID.');
//     setLoading(true);
//     try {
//       console.log('📤 Sending OTP for member:', memberId);
//       const response = await axios.post(`${BASE_URL}/sendOTP/member`, { 
//         memberID: memberId 
//       }, {
//         headers: {
//           'client-type': 'mobile'
//         },
//         timeout: 100000
//       });

//       console.log('✅ OTP sent response:', response.data);
//       setOtpSent(true);
//       Alert.alert('Success', 'OTP sent to your registered email.');
//     } catch (err) {
//       console.error('❌ OTP send error:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data,
//         config: err.config
//       });
//       Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP. Please check your Member ID.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     if (!otp) return Alert.alert('Error', 'Please enter the OTP.');
//     if (!memberId) return Alert.alert('Error', 'Member ID is required.');

//     setLoading(true);
//     try {
//       console.log('🔐 Verifying OTP:', { memberId, otp });

//       const res = await axios.post(`${BASE_URL}/login/member`, {
//         memberID: memberId,
//         otp: otp,
//       }, {
//         headers: {
//           'client-type': 'mobile'
//         },
//         timeout: 10000
//       });

//       console.log('✅ OTP verification response:', res.data);

//       let tokens = {};
//       let userInfo = {};

//       if (res.data.access_token && res.data.refresh_token) {
//         tokens = {
//           access_token: res.data.access_token,
//           refresh_token: res.data.refresh_token
//         };

//         // Decode the JWT token to get member information
//         const decodedToken = decodeJWT(res.data.access_token);
//         console.log('🔓 Decoded JWT token:', decodedToken);

//         if (decodedToken) {
//           userInfo = {
//             role: 'MEMBER',
//             name: decodedToken.name || 'Member',
//             email: decodedToken.email || '',
//             memberId: decodedToken.id || memberId
//           };
//         } else {
//           // Fallback if decoding fails
//           userInfo = {
//             role: 'MEMBER',
//             name: 'Member',
//             email: '',
//             memberId: memberId
//           };
//         }
//       } else {
//         throw new Error('No tokens received from server');
//       }

//       console.log('📝 UserInfo to be stored:', userInfo);

//       // Store tokens and user data
//       await storeAuthData(tokens, userInfo);

//       // Update global auth state
//       login(userInfo);

//       Alert.alert('Success', 'Login successful!');
//       console.log('✅ Tokens saved and global auth updated');

//       // Navigate to start without params
//       navigation.navigate('start');

//     } catch (err) {
//       console.error('❌ OTP verification error:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data,
//         config: {
//           url: err.config?.url,
//           data: err.config?.data
//         }
//       });

//       let errorMessage = 'Invalid OTP. Please try again.';

//       if (err.response?.status === 401) {
//         errorMessage = 'Invalid OTP. Please check and try again.';
//       } else if (err.response?.status === 404) {
//         errorMessage = 'Member not found. Please check your Member ID.';
//       } else if (err.response?.status === 400) {
//         errorMessage = err.response?.data?.message || 'Invalid request.';
//       } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
//         errorMessage = 'Network error. Please check your connection.';
//       } else if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       }

//       authContext.login(userData);

//       Alert.alert('Error', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // === ADMIN LOGIN ===
//   const handleAdminLogin = async () => {
//     if (!email || !password)
//       return Alert.alert('Error', 'Please enter email and password.');
//     setLoading(true);
//     try {
//       console.log('🔐 Admin login attempt:', { email });

//       const res = await axios.post(`${BASE_URL}/login/admin`, { 
//         email, 
//         password 
//       }, {
//         headers: {
//           'client-type': 'mobile'
//         },
//         timeout: 10000
//       });

//       console.log('✅ Admin login response:', res.data);

//       let tokens = {};
//       let userInfo = {};

//       if (res.data.access_token && res.data.refresh_token) {
//         tokens = {
//           access_token: res.data.access_token,
//           refresh_token: res.data.refresh_token
//         };

//         // Decode the JWT token to get admin information
//         const decodedToken = decodeJWT(res.data.access_token);
//         console.log('🔓 Decoded JWT token (Admin):', decodedToken);

//         if (decodedToken) {
//           userInfo = {
//             role: decodedToken.role || 'ADMIN',
//             name: decodedToken.name || 'Admin',
//             email: decodedToken.email || email
//           };
//         } else {
//           // Fallback if decoding fails
//           userInfo = {
//             role: 'ADMIN',
//             name: 'Admin',
//             email: email
//           };
//         }
//       } else {
//         throw new Error('No tokens received from server');
//       }

//       await storeAuthData(tokens, userInfo);

//       // Update global auth state
//       login(userInfo);

//       Alert.alert('Success', 'Admin login successful!');
//       console.log('✅ Admin tokens saved and global auth updated');

//       navigation.navigate('start');

//     } catch (err) {
//       console.error('❌ Admin login error:', {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data
//       });

//       let errorMessage = 'Login failed. Please try again.';

//       if (err.response?.status === 401) {
//         errorMessage = 'Invalid email or password.';
//       } else if (err.response?.status === 404) {
//         errorMessage = 'Admin account not found.';
//       } else if (err.code === 'NETWORK_ERROR') {
//         errorMessage = 'Network error. Please check your connection.';
//       } else if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       }

//       authContext.login(userData);

//       Alert.alert('Error', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleMode = () => {
//     setMode(mode === 'member' ? 'admin' : 'member');
//     setOtpSent(false);
//     setMemberId('');
//     setOtp('');
//     setEmail('');
//     setPassword('');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           <ImageBackground source={background} resizeMode="cover" style={styles.image}>
//             {/* Logo */}
//             <View style={styles.logoContainer}>
//               <Image source={logo} style={styles.logo} resizeMode="contain" />
//             </View>

//             <View style={styles.welcome}>
//               <Text style={styles.gret}>
//                 {mode === 'member' ? 'Member Login' : 'Admin Login'}
//               </Text>

//               {mode === 'member' ? (
//                 <>
//                   {!otpSent ? (
//                     <>
//                       <View style={styles.inputContainer}>
//                         <Text style={styles.icon}>🪪</Text>
//                         <TextInput
//                           placeholder="Enter Member ID"
//                           placeholderTextColor="rgba(0,0,0,0.5)"
//                           style={styles.input}
//                           value={memberId}
//                           onChangeText={setMemberId}
//                           autoCapitalize="none"
//                           autoCorrect={false}
//                           editable={!loading}
//                         />
//                       </View>

//                       <TouchableOpacity
//                         style={[styles.button, loading && styles.buttonDisabled]}
//                         onPress={handleSendOTP}
//                         disabled={loading}
//                       >
//                         {loading ? (
//                           <ActivityIndicator color="white" />
//                         ) : (
//                           <Text style={styles.buttonText}>Send OTP</Text>
//                         )}
//                       </TouchableOpacity>
//                     </>
//                   ) : (
//                     <>
//                       <View style={styles.inputContainer}>
//                         <Text style={styles.icon}>📧</Text>
//                         <TextInput
//                           placeholder="Enter OTP"
//                           placeholderTextColor="rgba(0,0,0,0.5)"
//                           style={styles.input}
//                           value={otp}
//                           onChangeText={setOtp}
//                           keyboardType="number-pad"
//                           editable={!loading}
//                         />
//                       </View>

//                       <TouchableOpacity
//                         style={[styles.button, loading && styles.buttonDisabled]}
//                         onPress={handleVerifyOTP}
//                         disabled={loading}
//                       >
//                         {loading ? (
//                           <ActivityIndicator color="white" />
//                         ) : (
//                           <Text style={styles.buttonText}>Verify OTP</Text>
//                         )}
//                       </TouchableOpacity>

//                       <TouchableOpacity 
//                         onPress={() => setOtpSent(false)}
//                         style={styles.backLink}
//                       >
//                         <Text style={styles.backLinkText}>
//                           ← Back to Member ID
//                         </Text>
//                       </TouchableOpacity>
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.inputContainer}>
//                     <Text style={styles.icon}>📧</Text>
//                     <TextInput
//                       placeholder="Enter Admin Email"
//                       placeholderTextColor="rgba(0,0,0,0.5)"
//                       style={styles.input}
//                       value={email}
//                       onChangeText={setEmail}
//                       keyboardType="email-address"
//                       autoCapitalize="none"
//                       autoCorrect={false}
//                       editable={!loading}
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.icon}>🔒</Text>
//                     <TextInput
//                       placeholder="Enter Password"
//                       placeholderTextColor="rgba(0,0,0,0.5)"
//                       style={styles.input}
//                       value={password}
//                       onChangeText={setPassword}
//                       secureTextEntry
//                       autoCapitalize="none"
//                       autoCorrect={false}
//                       editable={!loading}
//                     />
//                   </View>

//                   <TouchableOpacity
//                     style={[styles.button, loading && styles.buttonDisabled]}
//                     onPress={handleAdminLogin}
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <ActivityIndicator color="white" />
//                     ) : (
//                       <Text style={styles.buttonText}>Login</Text>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               )}

//               <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
//                 <Text style={styles.modeToggleText}>
//                   {mode === 'member' ? 'Login as Admin?' : 'Login as Member?'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ImageBackground>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContainer: { flexGrow: 1 },
//   image: {
//     flex: 1,
//     minHeight: '100%',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//   },
//   logoContainer: { alignItems: 'center' },
//   logo: { width: 400, height: 300, opacity: 0.6 },
//   welcome: {
//     marginTop: 100,
//     alignItems: 'center',
//     width: '80%',
//   },
//   gret: {
//     fontSize: 38,
//     color: 'white',
//     fontWeight: 'bold',
//     marginBottom: 30,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     height: 50,
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.5)',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   icon: { fontSize: 20, marginRight: 10 },
//   input: {
//     flex: 1,
//     height: '100%',
//     color: 'black',
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: 'rgba(216, 184, 54, 0.82)',
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 8,
//     marginTop: 10,
//     width: '100%',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.5)',
//   },
//   buttonDisabled: { opacity: 0.6 },
//   buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
//   modeToggle: { marginTop: 20 },
//   modeToggleText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
//   backLink: { marginTop: 15 },
//   backLinkText: { color: 'white', fontSize: 14, textDecorationLine: 'underline' },
// });

// export default LoginScr;

import React, { useState } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Use library instead of custom decoder
import { storeAuthData, getBaseUrl } from '../../config/apis';
import { useAuth } from './contexts/AuthContext';

const background = require('../../assets/bg.jpeg');
const logo = require('../../assets/logo.jpeg');

const LoginScr = ({ navigation }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('member');
  const [memberId, setMemberId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = `${getBaseUrl()}/auth`;

  // === MEMBER LOGIN ===
  // Helper function to mask email
  const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '***@***';

    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***';

    // Mask local part (show first 3 and last 1 character)
    let maskedLocal;
    if (localPart.length <= 4) {
      // For very short emails, show first char and mask the rest
      maskedLocal = localPart[0] + '*'.repeat(localPart.length - 1);
    } else {
      const firstThree = localPart.substring(0, 3);
      const lastOne = localPart.substring(localPart.length - 1);
      const middleLength = localPart.length - 4;
      maskedLocal = firstThree + '*'.repeat(middleLength) + lastOne;
    }

    // Mask domain completely to show only ***
    const domainParts = domain.split('.');
    let maskedDomain = '***';

    // Preserve the extension if it exists
    if (domainParts.length > 1) {
      const extension = domainParts.slice(1).join('.');
      maskedDomain += '.' + extension;
    }

    return `${maskedLocal}@${maskedDomain}`;
  };

  const handleSendOTP = async () => {
    if (!memberId.trim()) {
      Alert.alert('Error', 'Please enter your Member ID.');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP for member:', memberId);
      const response = await axios.post(
        `${BASE_URL}/sendOTP/member`,
        { memberID: memberId.trim() },
        {
          headers: { 'client-type': 'mobile' },
          timeout: 10000
        }
      );

      console.log('✅ OTP sent response:', response.data);

      // Extract email from response - the email is in 'accepted' array or 'envelope.to' array
      const userEmail = response.data?.accepted?.[0] ||
        response.data?.envelope?.to?.[0] ||
        response.data?.email ||
        response.data?.data?.email;

      console.log('📧 Extracted email:', userEmail);
      const maskedEmail = maskEmail(userEmail);
      console.log('🔒 Masked email:', maskedEmail);

      setOtpSent(true);

      // Display success alert with masked email and expiry info
      Alert.alert(
        'Success',
        `OTP sent to your registered email "${maskedEmail}"\n\nNote: OTP will expire after 1 hour.`
      );
    } catch (err) {
      console.error('❌ OTP send error:', err);

      // Check if the member is blocked or deactivated (403 Forbidden)
      if (err.response?.status === 403) {
        const message = err.response?.data?.message || 'Your account access has been restricted.';
        Alert.alert(
          '⚠️ Account Restricted',
          message + '\n\nIf you believe this is an error, please visit the club office or call the administration desk.',
          [
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }

      // Handle member not found
      if (err.response?.status === 400 || err.response?.status === 404) {
        Alert.alert(
          'Member Not Found',
          'The Member ID you entered was not found. Please check and try again.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      // Generic error handling
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }
    if (!memberId.trim()) {
      Alert.alert('Error', 'Member ID is required.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying OTP:', { memberId, otp });

      const response = await axios.post(
        `${BASE_URL}/login/member`,
        {
          memberID: memberId.trim(),
          otp: otp.trim(),
        },
        {
          headers: { 'client-type': 'mobile' },
          timeout: 10000
        }
      );

      console.log('✅ OTP verification response:', response.data);

      const { access_token, refresh_token } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error('No tokens received from server');
      }

      // Decode the JWT token to get member information
      let decodedToken;
      try {
        decodedToken = jwtDecode(access_token);
        console.log('🔓 Decoded JWT token:', decodedToken);
      } catch (decodeError) {
        console.error('Error decoding JWT:', decodeError);
        decodedToken = null;
      }

      const userInfo = {
        role: 'MEMBER',
        name: decodedToken?.name || 'Member',
        email: decodedToken?.email || '',
        memberId: decodedToken?.id || memberId.trim(),
        membershipNo: decodedToken?.membershipNo || decodedToken?.id || memberId.trim(),
        status: decodedToken?.status || 'ACTIVE', // Include member status for booking restrictions
        ...(decodedToken?.id && { id: decodedToken.id })
      };

      console.log('📝 UserInfo to be stored:', userInfo);

      // Store tokens and user data
      await storeAuthData({ access_token, refresh_token }, userInfo);

      // Update global auth state
      login(userInfo, access_token, refresh_token);

      Alert.alert('Success', 'Login successful!');
      console.log('✅ Tokens saved and global auth updated');

      // Navigate to start
      navigation.navigate('start');

    } catch (err) {
      console.error('❌ OTP verification error:', err);

      let errorMessage = 'Invalid OTP. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Member not found.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // === ADMIN LOGIN ===
  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Admin login attempt:', { email });

      const response = await axios.post(
        `${BASE_URL}/login/admin`,
        {
          email: email.trim(),
          password: password.trim()
        },
        {
          headers: { 'client-type': 'mobile' },
          timeout: 10000
        }
      );

      console.log('✅ Admin login response:', response.data);

      const { access_token, refresh_token } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error('No tokens received from server');
      }

      // Decode the JWT token
      let decodedToken;
      try {
        decodedToken = jwtDecode(access_token);
        console.log('🔓 Decoded JWT token (Admin):', decodedToken);
      } catch (decodeError) {
        console.error('Error decoding JWT:', decodeError);
        decodedToken = null;
      }

      const userInfo = {
        role: decodedToken?.role || 'ADMIN',
        name: decodedToken?.name || 'Admin',
        email: decodedToken?.email || email.trim(),
        ...(decodedToken?.id && { id: decodedToken.id })
      };

      await storeAuthData({ access_token, refresh_token }, userInfo);

      // Update global auth state
      login(userInfo, access_token, refresh_token);

      Alert.alert('Success', 'Admin login successful!');
      console.log('✅ Admin tokens saved and global auth updated');

      navigation.navigate('start');

    } catch (err) {
      console.error('❌ Admin login error:', err);

      let errorMessage = 'Login failed. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Admin account not found.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'member' ? 'admin' : 'member');
    setOtpSent(false);
    setMemberId('');
    setOtp('');
    setEmail('');
    setPassword('');
  };

  // In your login/signup success handler:
  const handleLoginSuccess = async (responseData) => {
    try {
      const { access_token, refresh_token, user } = responseData;

      // Store auth tokens and user data
      await storeAuthData(
        { access_token, refresh_token },
        user
      );

      console.log('✅ Login successful, stored user:', user);

      // Navigate to home
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login storage error:', error);
      Alert.alert('Error', 'Failed to save login information');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground source={background} resizeMode="cover" style={styles.image}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.welcome}>
              <Text style={styles.gret}>
                {mode === 'member' ? 'Member Login' : 'Admin Login'}
              </Text>

              {mode === 'member' ? (
                <>
                  {!otpSent ? (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.icon}>🪪</Text>
                        <TextInput
                          placeholder="Enter Member ID"
                          placeholderTextColor="rgba(0,0,0,0.5)"
                          style={styles.input}
                          value={memberId}
                          onChangeText={setMemberId}
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!loading}
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendOTP}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText}>Send OTP</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.icon}>📧</Text>
                        <TextInput
                          placeholder="Enter OTP"
                          placeholderTextColor="rgba(0,0,0,0.5)"
                          style={styles.input}
                          value={otp}
                          onChangeText={setOtp}
                          keyboardType="number-pad"
                          editable={!loading}
                          maxLength={6}
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleVerifyOTP}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.buttonText}>Verify OTP</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        style={styles.backLink}
                      >
                        <Text style={styles.backLinkText}>
                          ← Back to Member ID
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.icon}>📧</Text>
                    <TextInput
                      placeholder="Enter Admin Email"
                      placeholderTextColor="rgba(0,0,0,0.5)"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.icon}>🔒</Text>
                    <TextInput
                      placeholder="Enter Password"
                      placeholderTextColor="rgba(0,0,0,0.5)"
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleAdminLogin}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={toggleMode}
                style={styles.modeToggle}
                disabled={loading}
              >
                <Text style={styles.modeToggleText}>
                  {mode === 'member' ? 'Login as Admin?' : 'Login as Member?'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aboutButton}
                onPress={() => navigation.navigate('about')}
                activeOpacity={0.7}
              >
                <Text style={styles.aboutIcon}>ℹ️</Text>
                <Text style={styles.aboutText}>About PSC</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  image: {
    flex: 1,
    minHeight: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: { alignItems: 'center' },
  logo: { width: 400, height: 300, opacity: 0.6 },
  welcome: {
    marginTop: 70,
    alignItems: 'center',
    width: '80%',
  },
  gret: {
    fontSize: 38,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  icon: { fontSize: 20, marginRight: 10 },
  input: {
    flex: 1,
    height: '100%',
    color: 'black',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'rgba(216, 184, 54, 0.82)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modeToggle: { marginTop: 20 },
  modeToggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  backLink: { marginTop: 15 },
  backLinkText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  aboutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  aboutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LoginScr;