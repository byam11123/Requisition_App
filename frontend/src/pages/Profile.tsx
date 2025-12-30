import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { userManagementAPI, organizationAPI } from '../services/api';
import { updateUserProfile } from '../store/authSlice';
import {
    Container, Paper, Typography, Box, Grid, TextField, Button,
    Alert, Divider, Card, CardContent, Dialog, DialogTitle,
    DialogContent, DialogActions, Avatar, IconButton, Badge
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    VpnKey as VpnKeyIcon,
    Edit as EditIcon,
    CloudUpload as CloudUploadIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { RootState } from '../store/store';

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface EditProfileForm {
    fullName: string;
    designation: string;
    department: string;
}

interface EditOrganizationForm {
    name: string;
    requisitionPrefix: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
}

const Profile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [orgEditOpen, setOrgEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [organization, setOrganization] = useState<any>(null);

    const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch, formState: { errors: passwordErrors } } = useForm<ChangePasswordForm>();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue, formState: { errors: editErrors } } = useForm<EditProfileForm>();
    const { register: registerOrgEdit, handleSubmit: handleSubmitOrgEdit, reset: resetOrgEdit, setValue: setOrgValue, formState: { errors: orgEditErrors } } = useForm<EditOrganizationForm>();

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        if (isAdmin) {
            loadOrganization();
        }
    }, [isAdmin]);

    const loadOrganization = async () => {
        try {
            const response = await organizationAPI.getOrganization();
            if (response.data.success) {
                setOrganization(response.data.data);
            }
        } catch (err) {
            console.error('Failed to load organization', err);
        }
    };

    const handleChangePassword = async (data: ChangePasswordForm) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await userManagementAPI.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setSuccess('Password changed successfully!');
            setPasswordOpen(false);
            resetPassword();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = async (data: EditProfileForm) => {
        if (!user) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await userManagementAPI.updateUser(user.id, {
                fullName: data.fullName,
                designation: data.designation,
                department: data.department,
            });

            dispatch(updateUserProfile({
                fullName: data.fullName,
                designation: data.designation,
                department: data.department,
            }));

            setSuccess('Profile updated successfully!');
            setEditOpen(false);
            resetEdit();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEditOrganization = async (data: EditOrganizationForm) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await organizationAPI.updateOrganization(data);
            setSuccess('Organization updated successfully!');
            setOrgEditOpen(false);
            resetOrgEdit();
            loadOrganization();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update organization');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setLoading(true);
            setError('');
            try {
                const response = await userManagementAPI.uploadProfilePhoto(file);
                if (response.data.success) {
                    // Update redux state with new photo URL
                    // Assuming updateUserProfile updates the whole user object or merging is handled
                    const updatedUser = response.data.data;
                    dispatch(updateUserProfile({
                        ...user, // Keep existing fields
                        profilePhotoUrl: updatedUser.profilePhotoUrl
                    }));
                    setSuccess('Profile photo uploaded successfully!');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to upload profile photo');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setLoading(true);
            setError('');
            try {
                const response = await organizationAPI.uploadLogo(file);
                if (response.data.success) {
                    setOrganization(response.data.data);
                    setSuccess('Organization logo uploaded successfully!');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to upload organization logo');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpenEdit = () => {
        if (user) {
            setValue('fullName', user.fullName);
            setValue('designation', user.designation || '');
            setValue('department', user.department || '');
            setEditOpen(true);
        }
    };

    const handleOpenOrgEdit = () => {
        if (organization) {
            setOrgValue('name', organization.name || '');
            setOrgValue('requisitionPrefix', organization.requisitionPrefix || '');
            setOrgValue('contactEmail', organization.contactEmail || '');
            setOrgValue('contactPhone', organization.contactPhone || '');
            setOrgValue('address', organization.address || '');
            setOrgEditOpen(true);
        }
    };

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">User not found. Please log in again.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Profile
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Personal Information Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={3} mb={3}>
                        <Box position="relative">
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    <IconButton
                                        color="primary"
                                        aria-label="upload picture"
                                        component="label"
                                        sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'background.paper' } }}
                                        size="small"
                                    >
                                        <input hidden accept="image/*" type="file" onChange={handleProfilePhotoUpload} />
                                        <PhotoCameraIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <Avatar
                                    alt={user.fullName}
                                    src={user.profilePhotoUrl || undefined}
                                    sx={{ width: 100, height: 100, fontSize: '2.5rem' }}
                                >
                                    {user.fullName.charAt(0)}
                                </Avatar>
                            </Badge>
                        </Box>
                        <Box flexGrow={1} textAlign={{ xs: 'center', md: 'left' }}>
                            <Box display="flex" justifyContent={{ xs: 'center', md: 'space-between' }} alignItems="center" flexWrap="wrap" gap={2}>
                                <Typography variant="h6">Personal Information</Typography>
                                <Box display="flex" gap={1}>
                                    {isAdmin && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={handleOpenEdit}
                                            size="small"
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        startIcon={<VpnKeyIcon />}
                                        onClick={() => setPasswordOpen(true)}
                                        size="small"
                                    >
                                        Change Password
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <PersonIcon color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Full Name
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                                {user.fullName}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <EmailIcon color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Email Address
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                                {user.email}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <WorkIcon color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Role
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                {user.role?.toLowerCase()}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <BusinessIcon color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Department
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                                {user.department || '-'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <WorkIcon color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Designation
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                                {user.designation || '-'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <BusinessIcon color="action" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Organization
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="medium">
                                {user.organizationName || '-'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Organization Settings Card (Admin Only) */}
            {isAdmin && organization && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={3} mb={3}>
                            <Box position="relative">
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        <IconButton
                                            color="primary"
                                            aria-label="upload logo"
                                            component="label"
                                            sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'background.paper' } }}
                                            size="small"
                                        >
                                            <input hidden accept="image/*" type="file" onChange={handleLogoUpload} />
                                            <PhotoCameraIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <Avatar
                                        variant="rounded"
                                        alt={organization.name}
                                        src={organization.logoUrl || undefined}
                                        sx={{ width: 100, height: 100, fontSize: '2.5rem' }}
                                    >
                                        <BusinessIcon fontSize="large" />
                                    </Avatar>
                                </Badge>
                            </Box>

                            <Box flexGrow={1} textAlign={{ xs: 'center', md: 'left' }}>
                                <Box display="flex" justifyContent={{ xs: 'center', md: 'space-between' }} alignItems="center" flexWrap="wrap" gap={2}>
                                    <Typography variant="h6">Organization Settings</Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={handleOpenOrgEdit}
                                        size="small"
                                    >
                                        Edit Organization
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <BusinessIcon color="action" />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Organization Name
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="medium">
                                    {organization.name}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <VpnKeyIcon color="action" />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Requisition Prefix
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="medium">
                                    {organization.requisitionPrefix || '(Default)'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <EmailIcon color="action" />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Contact Email
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="medium">
                                    {organization.contactEmail}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <PersonIcon color="action" />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Contact Phone
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="medium">
                                    {organization.contactPhone || '-'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <BusinessIcon color="action" />
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Address
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="medium">
                                    {organization.address || '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {!isAdmin && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Note:</strong> To update your profile information (name, role, department, etc.),
                        please contact your organization administrator.
                    </Typography>
                </Paper>
            )}

            {/* Edit Profile Dialog (Admin Only) */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <form onSubmit={handleSubmitEdit(handleEditProfile)}>
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
                            {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Organization Dialog (Admin Only) */}
            <Dialog open={orgEditOpen} onClose={() => setOrgEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Organization</DialogTitle>
                <form onSubmit={handleSubmitOrgEdit(handleEditOrganization)}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            label="Organization Name"
                            margin="normal"
                            {...registerOrgEdit('name', { required: 'Organization name is required' })}
                            error={!!orgEditErrors.name}
                            helperText={orgEditErrors.name?.message}
                        />

                        <TextField
                            fullWidth
                            label="Requisition Prefix (e.g., ORB)"
                            margin="normal"
                            placeholder="Defaults to first 3 letters of name if empty"
                            inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 5 }}
                            {...registerOrgEdit('requisitionPrefix')}
                            helperText="Used in Request IDs (e.g., ORB/25/P00001)"
                        />

                        <TextField
                            fullWidth
                            label="Contact Email"
                            type="email"
                            margin="normal"
                            {...registerOrgEdit('contactEmail', { required: 'Contact email is required' })}
                            error={!!orgEditErrors.contactEmail}
                            helperText={orgEditErrors.contactEmail?.message}
                        />

                        <TextField
                            fullWidth
                            label="Contact Phone"
                            margin="normal"
                            {...registerOrgEdit('contactPhone')}
                        />

                        <TextField
                            fullWidth
                            label="Address"
                            margin="normal"
                            multiline
                            rows={3}
                            {...registerOrgEdit('address')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOrgEditOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Organization'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <form onSubmit={handleSubmitPassword(handleChangePassword)}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            label="Current Password"
                            type="password"
                            margin="normal"
                            {...registerPassword('currentPassword', { required: 'Current password is required' })}
                            error={!!passwordErrors.currentPassword}
                            helperText={passwordErrors.currentPassword?.message}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            margin="normal"
                            {...registerPassword('newPassword', {
                                required: 'New password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                validate: {
                                    hasUpper: (value) => /[A-Z]/.test(value) || 'Must contain uppercase letter',
                                    hasLower: (value) => /[a-z]/.test(value) || 'Must contain lowercase letter',
                                    hasNumber: (value) => /[0-9]/.test(value) || 'Must contain number',
                                    hasSpecial: (value) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value) || 'Must contain special character'
                                }
                            })}
                            error={!!passwordErrors.newPassword}
                            helperText={passwordErrors.newPassword?.message}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            margin="normal"
                            {...registerPassword('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => value === watch('newPassword') || 'Passwords do not match'
                            })}
                            error={!!passwordErrors.confirmPassword}
                            helperText={passwordErrors.confirmPassword?.message}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPasswordOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Profile;
