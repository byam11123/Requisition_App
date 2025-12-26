import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Container, Paper, Typography, Alert, Stack, InputAdornment } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { authAPI } from '../services/api';
import { setUser, setError, setLoading } from '../store/authSlice';
import { RootState } from '../store/store';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error, isLoading } = useSelector((state: RootState) => state.auth);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            const response = await authAPI.login({ email, password });

            if (response.data.success) {
                dispatch(setUser(response.data.data));
                navigate('/dashboard');
            } else {
                dispatch(setError(response.data.message));
            }
        } catch (err: any) {
            dispatch(setError(err.response?.data?.message || 'Login failed'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2
            }}
        >
            <Container maxWidth="xs" disableGutters>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                >
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to manage your requisitions
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    <form onSubmit={handleAuth}>
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={isLoading}
                                size="large"
                                sx={{ py: 1.5, fontSize: '1rem' }}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </Stack>
                    </form>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an organization?
                        </Typography>
                        <Button
                            onClick={() => navigate('/register-organization')}
                            sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Register Organization
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
