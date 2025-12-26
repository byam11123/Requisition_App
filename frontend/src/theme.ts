import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Mobile-first premium theme
let theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#2563eb', // Modern Blue
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0f766e', // Teal
            light: '#2dd4bf',
            dark: '#115e59',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc', // Slate 50
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b', // Slate 800
            secondary: '#64748b', // Slate 500
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    },
                },
                sizeLarge: {
                    padding: '12px 24px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #e2e8f0',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
