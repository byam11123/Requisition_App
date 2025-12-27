import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';
import { userManagementAPI } from '../services/api';
import {
    Container, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Chip, IconButton, Alert, Box, Menu, InputAdornment, FormControl, InputLabel, Select
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Person as PersonIcon, MoreVert as MoreVertIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

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
    const dispatch = useDispatch();
    const currentUser = useSelector((state: any) => state.auth.user);
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'deactivate' | 'activate' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue, formState: { errors: editErrors } } = useForm<Partial<CreateUserForm>>();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userManagementAPI.getAllUsers();
            if (response.data.success) {
                const allUsers = response.data.data;
                // Filter out the organization admin (first ADMIN user - the one who created the organization)
                // Find the first ADMIN user (organization creator) and exclude them
                const adminUsers = allUsers.filter((u: User) => u.role === 'ADMIN');
                const orgCreatorId = adminUsers.length > 0 ? Math.min(...adminUsers.map((u: User) => u.id)) : null;

                // Exclude the organization creator from the list
                const filteredUsers = allUsers.filter((u: User) => u.id !== orgCreatorId);
                setUsers(filteredUsers);
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

    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setValue('fullName', user.fullName);
        setValue('role', user.role);
        setValue('designation', user.designation || '');
        setValue('department', user.department || '');
        setEditOpen(true);
    };

    const handleEditUser = async (data: Partial<CreateUserForm>) => {
        if (!selectedUser) return;
        setLoading(true);
        setError('');
        try {
            await userManagementAPI.updateUser(selectedUser.id, {
                fullName: data.fullName,
                role: data.role,
                designation: data.designation,
                department: data.department,
            });

            // If the updated user is the currently logged-in user, update their profile in Redux
            if (currentUser && selectedUser.id === currentUser.id) {
                dispatch(updateUserProfile({
                    fullName: data.fullName,
                    role: data.role,
                    designation: data.designation,
                    department: data.department,
                }));
            }

            setEditOpen(false);
            resetEdit();
            setSelectedUser(null);
            loadUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleConfirmAction = (action: 'deactivate' | 'activate' | 'delete') => {
        setConfirmAction(action);
        setConfirmOpen(true);
        handleMenuClose();
    };

    const handleExecuteAction = async () => {
        if (!selectedUser || !confirmAction) return;
        setLoading(true);
        setError('');
        try {
            if (confirmAction === 'deactivate') {
                await userManagementAPI.deactivateUser(selectedUser.id);
            } else if (confirmAction === 'activate') {
                await userManagementAPI.activateUser(selectedUser.id);
            } else if (confirmAction === 'delete') {
                await userManagementAPI.deleteUser(selectedUser.id);
            }
            setConfirmOpen(false);
            setConfirmAction(null);
            setSelectedUser(null);
            loadUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${confirmAction} user`);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search and filters
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.designation?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && user.isActive) ||
                (statusFilter === 'INACTIVE' && !user.isActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);


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

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: '250px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={roleFilter}
                            label="Role"
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All Roles</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="PURCHASER">Purchaser</MenuItem>
                            <MenuItem value="MANAGER">Manager</MenuItem>
                            <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

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
                        {filteredUsers.map((user) => (
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
                                    <IconButton size="small" onClick={() => handleOpenEdit(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                                        ? 'No users match your filters'
                                        : 'No users found'}
                                </TableCell>
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
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                validate: {
                                    hasUpper: (value) => /[A-Z]/.test(value) || 'Must contain uppercase letter',
                                    hasLower: (value) => /[a-z]/.test(value) || 'Must contain lowercase letter',
                                    hasNumber: (value) => /[0-9]/.test(value) || 'Must contain number',
                                    hasSpecial: (value) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value) || 'Must contain special character'
                                }
                            })}
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

            {/* Edit User Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <form onSubmit={handleSubmitEdit(handleEditUser)}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            label="Full Name"
                            margin="normal"
                            {...registerEdit('fullName', { required: 'Name is required' })}
                            error={!!editErrors.fullName}
                            helperText={editErrors.fullName?.message}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Role"
                            margin="normal"
                            defaultValue={selectedUser?.role || 'PURCHASER'}
                            {...registerEdit('role')}
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
                            {...registerEdit('designation')}
                        />
                        <TextField
                            fullWidth
                            label="Department"
                            margin="normal"
                            {...registerEdit('department')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedUser?.isActive ? (
                    <MenuItem onClick={() => handleConfirmAction('deactivate')}>
                        <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                        Deactivate User
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => handleConfirmAction('activate')}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                        Activate User
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleConfirmAction('delete')} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete User
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>
                    {confirmAction === 'delete' ? 'Delete User' : confirmAction === 'deactivate' ? 'Deactivate User' : 'Activate User'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Typography>
                        Are you sure you want to {confirmAction} <strong>{selectedUser?.fullName}</strong>?
                        {confirmAction === 'delete' && ' This action cannot be undone.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleExecuteAction}
                        variant="contained"
                        color={confirmAction === 'delete' ? 'error' : 'primary'}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmAction === 'delete' ? 'Delete' : confirmAction === 'deactivate' ? 'Deactivate' : 'Activate'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
