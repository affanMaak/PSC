//ios test
// import React, { useState, useEffect } from 'react';
// import { Alert, StyleSheet, View, AppState, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
// import { supabase } from '../lib/supabase';

// export default function Auth({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     const handleAppStateChange = (state) => {
//       if (state === 'active') {
//         supabase.auth.startAutoRefresh();
//       } else {
//         supabase.auth.stopAutoRefresh();
//       }
//     };

//     const subscription = AppState.addEventListener('change', handleAppStateChange);
//     return () => subscription.remove();
//   }, []);

//   const handleAuth = async (isLogin) => {
//     if (!email || !password) {
//       Alert.alert('Missing Information', 'Please enter both email and password');
//       return;
//     }

//     if (password.length < 6) {
//       Alert.alert('Password Too Short', 'Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);

//     try {
//       if (isLogin) {
//         const { error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error) throw error;
//         navigation.replace('Account');
//       } else {
//         const { data: { user }, error: signupError } = await supabase.auth.signUp({ 
//           email, 
//           password,
//           options: { 
//             emailRedirectTo: 'yourapp://callback',
//             data: {
//               email: email // This will be available in auth.users
//             }
//           }
//         });

//         if (signupError) throw signupError;

//         // Create profile without password storage (recommended)
//         const { error: profileError } = await supabase
//           .from('profiles')
//           .insert({
//             id: user.id,
//             email: user.email,
//             password: user.password,
//             username: user.email.split('@')[0],
//             created_at: new Date().toISOString()
//           });

//         if (profileError) throw profileError;

//         Alert.alert(
//           'Success', 
//           'Account created! Please check your email for verification'
//         );
//       }
//     } catch (error) {
//       console.error('Auth error:', error);

//       let errorMessage = error.message;
//       if (error.message.includes('User already registered')) {
//         errorMessage = 'This email is already registered. Please log in.';
//       } else if (error.message.includes('email column')) {
//         errorMessage = 'Database configuration error. Please contact support.';
//       }

//       Alert.alert(
//         'Authentication Error', 
//         errorMessage || 'Something went wrong. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>SavSplit</Text>
//       <Image source={require('../assets/logo.jpeg')} style={styles.logo} />

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="email@address.com"
//           placeholderTextColor="#888"
//           value={email}
//           onChangeText={setEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//           editable={!loading}
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Password</Text>
//         <View style={styles.passwordInput}>
//           <TextInput
//             style={styles.input}
//             placeholder="Password (min 6 characters)"
//             placeholderTextColor="#888"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//             autoCapitalize="none"
//             editable={!loading}
//           />
//           <TouchableOpacity 
//             style={styles.showHide}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Text style={styles.showHideText}>
//               {showPassword ? 'HIDE' : 'SHOW'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={() => handleAuth(true)}
//         disabled={loading}
//       >
//         {loading ? (
// <ActivityIndicator size="small" color="#FFF0DC" />

//         ) : (
//           <Text style={styles.buttonText}>LOG IN</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.secondaryButton, loading && styles.buttonDisabled]}
//         onPress={() => handleAuth(false)}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#D2B48C" />
//         ) : (
//           <Text style={styles.secondaryButtonText}>CREATE ACCOUNT</Text>
//         )}
//       </TouchableOpacity>

//       <Text style={styles.footer2}>
//         Your information is securely encrypted
//       </Text>

//       <View style={styles.footer}>
//               <Text style={styles.footerText}> product of Code Club</Text>
//             </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   header: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#FFF0DC',
//     textAlign: 'center',
//     marginBottom: 20,
//     fontFamily: 'Helvetica Neue',
//   },
//   logo: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     alignSelf: 'center',
//     marginBottom: 40,
//     borderWidth: 1,
//     borderColor: '#FFF0DC',
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     color: '#FFF0DC',
//     fontSize: 14,
//     marginBottom: 8,
//     fontWeight: '600',
//   },
//   input: {
//     backgroundColor: '#1E1E1E',
//     color: '#FFF0DC',
//     fontSize: 16,
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   passwordInput: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1E1E1E',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   showHide: {
//     paddingHorizontal: 15,
//   },
//   showHideText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   button: {
//     backgroundColor: '#543A14',
//     padding: 16,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: '#FFF0DC',
//   },
//   secondaryButton: {
//     backgroundColor: '#1E1E1E',
//     padding: 16,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginTop: 15,
//     borderWidth: 1,
//     borderColor: '#FFF0DC',
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   secondaryButtonText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   footer2:  {
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 60,
//     fontSize: 12,
//   },
//   footer: {
//     paddingVertical: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#333',
//     marginTop: 10,
//   },
//   footerText: {
//     color: '#888',
//     fontSize: 14,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
// });

//forgot password not ok
// import React, { useState, useEffect } from 'react';
// import { Alert, StyleSheet, View, AppState, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
// import { supabase } from '../lib/supabase';

// export default function Auth({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isSignUp, setIsSignUp] = useState(false);

//   useEffect(() => {
//   const { data: authListener } = supabase.auth.onAuthStateChange(
//     async (event, session) => {
//       if (event === 'PASSWORD_RECOVERY') {
//         navigation.navigate('UpdatePassword');
//       }
//     }
//   );

//   return () => {
//     authListener?.subscription?.unsubscribe();
//   };
// }, [navigation]);

//   useEffect(() => {
//     const handleAppStateChange = (state) => {
//       if (state === 'active') {
//         supabase.auth.startAutoRefresh();
//       } else {
//         supabase.auth.stopAutoRefresh();
//       }
//     };

//     const subscription = AppState.addEventListener('change', handleAppStateChange);
//     return () => subscription.remove();
//   }, []);

//   const handleAuth = async () => {
//     if (!email || !password) {
//       Alert.alert('Missing Information', 'Please enter both email and password');
//       return;
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       Alert.alert('Invalid Email', 'Please enter a valid email address');
//       return;
//     }

//     if (isSignUp && password !== confirmPassword) {
//       Alert.alert('Password Mismatch', 'Passwords do not match');
//       return;
//     }

//     if (password.length < 6) {
//       Alert.alert('Password Too Short', 'Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);

//     try {
//       if (!isSignUp) {
//         // Login logic
//         const { error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error) throw error;
//         navigation.replace('Home'); // Navigate to Home instead of Account
//       } else {
//         // Signup logic
//         const { data: { user }, error: signupError } = await supabase.auth.signUp({ 
//           email, 
//           password,
//           options: { 
//             emailRedirectTo: 'yourapp://callback',
//             data: {
//               email: email
//             }
//           }
//         });

//         if (signupError) throw signupError;

//         // Create profile with password storage
//         const { error: profileError } = await supabase
//           .from('profiles')
//           .insert({
//             id: user.id,
//             email: user.email,
//             password: password,
//             username: user.email.split('@')[0],
//             created_at: new Date().toISOString()
//           });

//         if (profileError) throw profileError;

//         Alert.alert(
//           'Success', 
//           'Account created successfully!',
//           [
//             {
//               text: 'OK',
//               onPress: () => {
//                 // Navigate to Home screen after successful signup
//                 navigation.replace('Home');
//               }
//             }
//           ]
//         );
//       }
//     } catch (error) {
//       console.error('Auth error:', error);

//       let errorMessage = error.message;
//       if (error.message.includes('User already registered')) {
//         errorMessage = 'This email is already registered. Please log in.';
//       } else if (error.message.includes('Invalid login credentials')) {
//         errorMessage = 'Invalid email or password. Please try again.';
//       } else if (error.message.includes('email column')) {
//         errorMessage = 'Database configuration error. Please contact support.';
//       }

//       Alert.alert(
//         'Authentication Error', 
//         errorMessage || 'Something went wrong. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAuthMode = () => {
//     setIsSignUp(!isSignUp);
//     setPassword('');
//     setConfirmPassword('');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>SavSplit</Text>
//       <Image source={require('../assets/logo1.png')} style={styles.logo} />

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Email</Text>
//         <View style={styles.inputWrapper}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter your email address"
//             placeholderTextColor="#888"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
//             keyboardType="email-address"
//             editable={!loading}
//           />
//         </View>
//       </View>

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Password</Text>
//         <View style={styles.passwordInput}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter password (min 6 characters)"
//             placeholderTextColor="#888"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//             autoCapitalize="none"
//             editable={!loading}
//           />
//           <TouchableOpacity 
//             style={styles.showHide}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Text style={styles.showHideText}>
//               {showPassword ? 'HIDE' : 'SHOW'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <TouchableOpacity
//   style={styles.forgotPasswordButton}
//   onPress={() => navigation.navigate('ForgotPassword')}
//   disabled={loading}
// >
//   <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
// </TouchableOpacity>

//       {isSignUp && (
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Confirm Password</Text>
//           <View style={styles.passwordInput}>
//             <TextInput
//               style={styles.input}
//               placeholder="Confirm your password"
//               placeholderTextColor="#888"
//               value={confirmPassword}
//               onChangeText={setConfirmPassword}
//               secureTextEntry={!showConfirmPassword}
//               autoCapitalize="none"
//               editable={!loading}
//             />
//             <TouchableOpacity 
//               style={styles.showHide}
//               onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//             >
//               <Text style={styles.showHideText}>
//                 {showConfirmPassword ? 'HIDE' : 'SHOW'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleAuth}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#FFF0DC" />
//         ) : (
//           <Text style={styles.buttonText}>
//             {isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
//           </Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.secondaryButton, loading && styles.buttonDisabled]}
//         onPress={toggleAuthMode}
//         disabled={loading}
//       >
//         <Text style={styles.secondaryButtonText}>
//           {isSignUp ? 'BACK TO LOGIN' : 'CREATE NEW ACCOUNT'}
//         </Text>
//       </TouchableOpacity>

//       <Text style={styles.footer2}>
//         Your information is securely encrypted
//       </Text>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}> product of Code Club</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   header: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#FFF0DC',
//     textAlign: 'center',
//     marginBottom: 20,
//     fontFamily: 'Helvetica Neue',
//   },
//   logo: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     alignSelf: 'center',
//     marginBottom: 40,
//     borderWidth: 1,
//     borderColor: '#FFF0DC',
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     color: '#FFF0DC',
//     fontSize: 14,
//     marginBottom: 8,
//     fontWeight: '600',
//   },
//   inputWrapper: {
//     backgroundColor: '#1E1E1E',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//    input: {
//     backgroundColor: '#1E1E1E',
//     color: '#FFF0DC',
//     fontSize: 16,
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#333',
//    },
//   passwordInput: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1E1E1E',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   showHide: {
//     paddingHorizontal: 15,
//   },
//   showHideText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   button: {
//     backgroundColor: '#543A14',
//     padding: 16,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: '#FFF0DC',
//   },
//   secondaryButton: {
//     backgroundColor: '#1E1E1E',
//     padding: 16,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginTop: 15,
//     borderWidth: 1,
//     borderColor: '#FFF0DC',
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   secondaryButtonText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   footer2:  {
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 60,
//     fontSize: 12,
//   },
//   footer: {
//     paddingVertical: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#333',
//     marginTop: 10,
//   },
//   footerText: {
//     color: '#888',
//     fontSize: 14,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   forgotPasswordButton: {
//   padding: 16,
//   alignItems: 'center',
//   marginTop: 10,
// },
// forgotPasswordText: {
//   color: '#FFF0DC',
//   fontSize: 14,
//   textDecorationLine: 'underline',
// },
// });


import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, AppState, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Auth({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (!isSignUp) {
        // Login logic
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigation.replace('Home'); // Navigate to Home instead of Account
      } else {
        // Signup logic
        const { data: { user }, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'yourapp://callback',
            data: {
              email: email
            }
          }
        });

        if (signupError) throw signupError;

        // Create profile with password storage
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            password: password,
            username: user.email.split('@')[0],
            created_at: new Date().toISOString()
          });

        if (profileError) throw profileError;

        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to Home screen after successful signup
                navigation.replace('Home');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Auth error:', error);

      let errorMessage = error.message;
      if (error.message.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please log in.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('email column')) {
        errorMessage = 'Database configuration error. Please contact support.';
      }

      Alert.alert(
        'Authentication Error',
        errorMessage || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SavSplit</Text>
      <Image source={require('../assets/logo.jpeg')} style={styles.logo} />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            placeholder="Enter password (min 6 characters)"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.showHide}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showHideText}>
              {showPassword ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isSignUp && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.showHide}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.showHideText}>
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF0DC" />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, loading && styles.buttonDisabled]}
        onPress={toggleAuthMode}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>
          {isSignUp ? 'BACK TO LOGIN' : 'CREATE NEW ACCOUNT'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer2}>
        Your information is securely encrypted
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}> product of Code Club</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF0DC',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica Neue',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FFF0DC',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#FFF0DC',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF0DC',
    fontSize: 16,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  showHide: {
    paddingHorizontal: 15,
  },
  showHideText: {
    color: '#FFF0DC',
    fontWeight: 'bold',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#543A14',
    padding: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFF0DC',
  },
  secondaryButton: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FFF0DC',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF0DC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#FFF0DC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer2: {
    color: '#888',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 12,
  },
  footer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 10,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 