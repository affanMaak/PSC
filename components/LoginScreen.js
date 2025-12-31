// import React, { useState, useEffect } from 'react';
// import { Alert, StyleSheet, View, AppState, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
// import { supabase } from '../lib/supabase';

// export default function LoginScreen({ navigation }) {
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

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Missing Information', 'Please enter both email and password');
//       return;
//     }

//     setLoading(true);

//     try {
//       const { error } = await supabase.auth.signInWithPassword({ email, password });
//       if (error) throw error;
//       navigation.replace('Home');
//     } catch (error) {
//       console.error('Login error:', error);
//       Alert.alert('Login Error', error.message || 'Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>SavSplit</Text>
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
//             placeholder="Enter your password"
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
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#FFF0DC" />
//         ) : (
//           <Text style={styles.buttonText}>LOG IN</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.linkButton]}
//         onPress={() => navigation.navigate('SignUp')}
//         disabled={loading}
//       >
//         <Text style={styles.linkButtonText}>Don't have an account? Sign up</Text>
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Navigation will be handled by App.js based on session state
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', error.message || 'Invalid email or password');
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
          <Text style={styles.header}>SavSplit</Text>
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
                placeholder="Enter your password"
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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF0DC" />
            ) : (
              <Text style={styles.buttonText}>LOG IN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={styles.linkButtonText}>Don't have an account? Sign up</Text>
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
    fontSize: 36,
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
    marginBottom: 50,
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