import React, { useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    StatusBar,
    Dimensions,
    SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        // Very short duration since native splash handles initial loading
        const timer = setTimeout(() => {
            if (onFinish) {
                onFinish();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="black" barStyle="dark-content" />
            <Image
                source={require('../assets/intro.jpeg')}
                style={styles.image}
                resizeMode="contain"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height,
    },
});

export default SplashScreen;
