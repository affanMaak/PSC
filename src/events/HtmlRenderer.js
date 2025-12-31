// import React from 'react';
// import { useWindowDimensions } from 'react-native';
// import RenderHtml from 'react-native-render-html';
// import { StyleSheet } from 'react-native';

// const HtmlRenderer = ({ htmlContent, textStyle }) => {
//     const { width } = useWindowDimensions();

//     // Clean HTML if needed
//     const cleanHtml = htmlContent || '';

//     const tagsStyles = {
//         body: {
//             color: '#333',
//             fontSize: 16,
//             lineHeight: 24,
//         },
//         p: {
//             marginBottom: 12,
//             color: textStyle?.color || '#333',
//             fontSize: textStyle?.fontSize || 16,
//             lineHeight: textStyle?.lineHeight || 24,
//         },
//         h1: {
//             fontSize: 24,
//             fontWeight: 'bold',
//             marginTop: 20,
//             marginBottom: 10,
//             color: '#333',
//         },
//         h2: {
//             fontSize: 20,
//             fontWeight: 'bold',
//             marginTop: 18,
//             marginBottom: 8,
//             color: '#333',
//         },
//         h3: {
//             fontSize: 18,
//             fontWeight: '600',
//             marginTop: 16,
//             marginBottom: 6,
//             color: '#333',
//         },
//         ul: {
//             marginBottom: 12,
//         },
//         ol: {
//             marginBottom: 12,
//         },
//         li: {
//             fontSize: 16,
//             lineHeight: 24,
//             marginBottom: 4,
//             color: '#333',
//         },
//         strong: {
//             fontWeight: 'bold',
//         },
//         em: {
//             fontStyle: 'italic',
//         },
//         u: {
//             textDecorationLine: 'underline',
//         },
//         a: {
//             color: '#A3834C',
//             textDecorationLine: 'underline',
//         },
//     };

//     const baseStyle = {
//         color: '#333',
//         fontSize: 16,
//         lineHeight: 24,
//         ...textStyle,
//     };

//     return (
//         <RenderHtml
//             contentWidth={width - 40} // Account for padding
//             source={{ html: cleanHtml }}
//             tagsStyles={tagsStyles}
//             baseStyle={baseStyle}
//             enableExperimentalMarginCollapsing={true}
//             renderersProps={{
//                 img: {
//                     enableExperimentalPercentWidth: true,
//                 },
//             }}
//             systemFonts={['System', 'Helvetica', 'Arial']}
//         />
//     );
// };



// export default HtmlRenderer;



import React from 'react';
import { useWindowDimensions, StyleSheet, Text, Platform } from 'react-native';
import RenderHtml from 'react-native-render-html';

const HtmlRenderer = ({ htmlContent, textStyle, maxLines }) => {
    const { width } = useWindowDimensions();

    const getCleanHtml = () => {
        if (htmlContent === null || htmlContent === undefined) return '';

        let content = '';
        if (typeof htmlContent === 'string') {
            content = htmlContent;
        } else if (typeof htmlContent === 'object') {
            try {
                content = JSON.stringify(htmlContent);
            } catch (e) {
                return '';
            }
        } else {
            content = String(htmlContent);
        }

        return content
            .trim()
            .replace(/&nbsp;/g, ' ')
            .replace(/<iframe[^>]*>.*?<\/iframe>/g, '')
            || '';
    };

    const cleanHtml = getCleanHtml();

    if (!cleanHtml || cleanHtml.trim() === '') {
        return <Text style={[styles.placeholder, textStyle]}>No content available</Text>;
    }

    // Platform-specific adjustments
    const baseFontSize = Platform.OS === 'android' ? 15 : 16;
    const baseLineHeight = Platform.OS === 'android' ? 22 : 24;

    // Base style for the HTML content
    const baseStyle = {
        color: textStyle?.color || '#333',
        fontSize: textStyle?.fontSize || baseFontSize,
        lineHeight: textStyle?.lineHeight || baseLineHeight,
        fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
        ...(maxLines && { numberOfLines: maxLines }),
    };

    // Tags styles configuration
    const tagsStyles = {
        body: {
            ...baseStyle,
            margin: 0,
            padding: 0,
        },
        p: {
            ...baseStyle,
            marginTop: 0,
            marginBottom: 12,
        },
        div: baseStyle,
        span: baseStyle,
        h1: {
            fontSize: 24,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 10,
            color: '#333',
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
        },
        h2: {
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 18,
            marginBottom: 8,
            color: '#333',
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
        },
        h3: {
            fontSize: 18,
            fontWeight: '600',
            marginTop: 16,
            marginBottom: 6,
            color: '#333',
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
        },
        ul: {
            marginBottom: 12,
            paddingLeft: 20,
        },
        ol: {
            marginBottom: 12,
            paddingLeft: 20,
        },
        li: {
            fontSize: baseFontSize,
            lineHeight: baseLineHeight,
            marginBottom: 4,
            color: '#333',
            fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
        },
        strong: {
            fontWeight: 'bold',
        },
        b: {
            fontWeight: 'bold',
        },
        em: {
            fontStyle: 'italic',
        },
        i: {
            fontStyle: 'italic',
        },
        u: {
            textDecorationLine: 'underline',
        },
        a: {
            color: '#A3834C',
            textDecorationLine: 'underline',
        },
    };

    // System fonts for consistent rendering
    const systemFonts = Platform.OS === 'android'
        ? ['Roboto', 'sans-serif']
        : ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'];

    const renderersProps = {
        img: {
            enableExperimentalPercentWidth: false
        }
    };

    const contentWidth = width - (Platform.OS === 'android' ? 40 : 30);

    return (
        <RenderHtml
            contentWidth={contentWidth}
            source={{ html: cleanHtml }}
            tagsStyles={tagsStyles}
            baseStyle={baseStyle}
            systemFonts={systemFonts}
            enableExperimentalMarginCollapsing={true}
            renderersProps={renderersProps}
            ignoredDomTags={['iframe', 'script', 'style']}
            ignoredStyles={['width', 'height']}
            // Add support for maxLines by using numberOfLines prop
            defaultTextProps={{
                numberOfLines: maxLines,
                ellipsizeMode: maxLines ? 'tail' : undefined,
            }}
        />
    );
};

const styles = StyleSheet.create({
    placeholder: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    },
});

export default HtmlRenderer;