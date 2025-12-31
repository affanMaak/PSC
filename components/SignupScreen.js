// import React, { useState, useEffect } from 'react';
// import { Alert, StyleSheet, View, AppState, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
// import { supabase } from '../lib/supabase';

// export default function SignUpScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

//   const validateForm = () => {
//     if (!email || !password || !confirmPassword) {
//       Alert.alert('Missing Information', 'Please fill in all fields');
//       return false;
//     }

//     if (password.length < 6) {
//       Alert.alert('Password Too Short', 'Password must be at least 6 characters');
//       return false;
//     }

//     if (password !== confirmPassword) {
//       Alert.alert('Password Mismatch', 'Passwords do not match');
//       return false;
//     }

//     return true;
//   };

//   const handleSignUp = async () => {
//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       // Create auth user in Supabase
//       const { data: { user }, error: signupError } = await supabase.auth.signUp({ 
//         email, 
//         password,
//         options: { 
//           emailRedirectTo: 'yourapp://callback'
//         }
//       });

//       if (signupError) throw signupError;

//       // ⚠️ SECURITY WARNING: Storing password in plain text is dangerous
//       // Create profile with password stored in profiles table (as requested)
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .insert({
//           id: user.id,
//           email: user.email,
//           password: password, // ⚠️ Storing plain text password - NOT RECOMMENDED
//           confirm_password: confirmPassword, // ⚠️ Storing confirm password - NOT RECOMMENDED
//           username: user.email.split('@')[0],
//           created_at: new Date().toISOString()
//         });

//       if (profileError) {
//         // If profile creation fails, try to delete the auth user
//         await supabase.auth.admin.deleteUser(user.id);
//         throw profileError;
//       }

//       Alert.alert(
//         'Success', 
//         'Account created! Please check your email for verification'
//       );

//       // Navigate back to login after successful signup
//       navigation.navigate('Login');

//     } catch (error) {
//       console.error('Signup error:', error);

//       let errorMessage = error.message;
//       if (error.message.includes('User already registered')) {
//         errorMessage = 'This email is already registered. Please log in.';
//       } else if (error.message.includes('email column')) {
//         errorMessage = 'Database configuration error. Please contact support.';
//       }

//       Alert.alert(
//         'Signup Error', 
//         errorMessage || 'Something went wrong. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Create Account</Text>
//       <Image source={require('../assets/logo.jpg')} style={styles.logo} />

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

//       <View style={styles.inputContainer}>
//         <Text style={styles.label}>Confirm Password</Text>
//         <View style={styles.passwordInput}>
//           <TextInput
//             style={styles.input}
//             placeholder="Confirm your password"
//             placeholderTextColor="#888"
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             secureTextEntry={!showConfirmPassword}
//             autoCapitalize="none"
//             editable={!loading}
//           />
//           <TouchableOpacity 
//             style={styles.showHide}
//             onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             <Text style={styles.showHideText}>
//               {showConfirmPassword ? 'HIDE' : 'SHOW'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleSignUp}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#FFF0DC" />
//         ) : (
//           <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.linkButton]}
//         onPress={() => navigation.navigate('Login')}
//         disabled={loading}
//       >
//         <Text style={styles.linkButtonText}>Already have an account? Log in</Text>
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
//   input: {
//     backgroundColor: '#1E1E1E',
//     color: '#FFF0DC',
//     fontSize: 16,
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#333',
//     flex: 1,
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
//   linkButton: {
//     padding: 16,
//     borderRadius: 28,
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: '#FFF0DC',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   linkButtonText: {
//     color: '#D2B48C',
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


import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: { user }, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'yourapp://callback'
        }
      });

      if (signupError) throw signupError;

      // Store in profiles table as requested
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          password: password,
          confirm_password: confirmPassword,
          username: user.email.split('@')[0],
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      Alert.alert(
        'Success',
        'Account created! Please check your email for verification',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.header}>Create Account</Text>
          <Image source={require('../assets/logo.jpeg')} style={styles.logo} />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@address.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF0DC" />
            ) : (
              <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.linkButtonText}>Already have an account? Log in</Text>
          </TouchableOpacity>

          <Text style={styles.footer2}>
            Your information is securely encrypted
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>product of Code Club</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
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
    letterSpacing: 1,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#FFF0DC',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: '#FFF0DC',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFF0DC',
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    flex: 1,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  showHide: {
    paddingHorizontal: 16,
  },
  showHideText: {
    color: '#D2B48C',
    fontWeight: 'bold',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#8B6914',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#D2B48C',
    shadowColor: '#D2B48C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  linkButton: {
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF0DC',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  linkButtonText: {
    color: '#D2B48C',
    fontWeight: '600',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer2: {
    color: '#888',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});