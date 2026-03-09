export const theme = {
    colors: {
        background: '#F9F9F9',
        surface: '#FFFFFF',
        primary: '#5478FF',
        secondary: '#6367FF',
        accent: '#00E5FF',
        accentSoft: '#00E5FF33',
        inputBackground: '#F1F1F1',
        placeholder: '#94a3b8',
        white: '#FFFFFF',
        error: '#ef4444',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
        huge: 60,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        pill: 100,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800' as const,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '800' as const,
            letterSpacing: -0.5,
        },
        sectionHeader: {
            fontSize: 12,
            fontWeight: '700' as const,
            letterSpacing: 1,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
        },
        label: {
            fontSize: 14,
            fontWeight: '600' as const,
        },
        buttonSuccess: {
            fontSize: 16,
            fontWeight: '700' as const,
        },
        caption: {
            fontSize: 12,
            fontWeight: '400' as const,
        }
    },
    shadows: {
        subtle: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 5,
        }
    }
};
