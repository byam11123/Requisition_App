import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { userManagementAPI } from '../services/api';
import {
    Container, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Chip, IconButton, Alert, Box
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Person as PersonIcon } from '@mui/icons-material';

interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
    designation: string;
    department: string;
    isActive: boolean;
}

interface CreateUserForm {
    email: string;
    fullName: string;
    password: string;
    role: string;
    designation: string;
    department: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userManagementAPI.getAllUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (err) {
            console.error("Failed to load users", err);
        }
    };

    const handleCreateUser = async (data: CreateUserForm) => {
        setLoading(true);
        setError('');
        try {
            await userManagementAPI.createUser(data);
            setOpen(false);
            reset();
            loadUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Add New User
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PersonIcon color="action" fontSize="small" />
                                        {user.fullName}
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        size="small"
                                        color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{user.designation || '-'}</TableCell>
                                <TableCell>{user.department || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.isActive ? 'Active' : 'Inactive'}
                                        size="small"
                                        color={user.isActive ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small">
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No users found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create User Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <form onSubmit={handleSubmit(handleCreateUser)}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            label="Full Name"
                            margin="normal"
                            {...register('fullName', { required: 'Name is required' })}
                            error={!!errors.fullName}
                            helperText={errors.fullName?.message}
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            margin="normal"
                            {...register('email', { required: 'Email is required' })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Role"
                            margin="normal"
                            defaultValue="PURCHASER"
                            {...register('role')}
                        >
                            <MenuItem value="PURCHASER">Purchaser (Create Requisitions)</MenuItem>
                            <MenuItem value="MANAGER">Manager (Approve Requisitions)</MenuItem>
                            <MenuItem value="ACCOUNTANT">Accountant (Process Payments)</MenuItem>
                            <MenuItem value="ADMIN">Admin (Manage Organization)</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Designation"
                            margin="normal"
                            {...register('designation')}
                        />
                        <TextField
                            fullWidth
                            label="Department"
                            margin="normal"
                            {...register('department')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
