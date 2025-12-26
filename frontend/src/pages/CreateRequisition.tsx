import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import {
    Container, Paper, Typography, TextField, Button, Grid,
    MenuItem, Box, Alert, Divider
} from '@mui/material';
import { ArrowBack as BackIcon, Send as SendIcon } from '@mui/icons-material';

interface CreateRequisitionForm {
    requisitionTypeId: number;
    siteAddress: string;
    materialDescription: string;
    quantity: number;
    amount: number;
    priority: string;
    poDetails: string;
    requiredFor: string;
    vendorName: string;
    indentNo: string;
    description: string;
}

const CreateRequisition: React.FC = () => {
    // Default values for better UX
    const { register, handleSubmit, formState: { errors } } = useForm<CreateRequisitionForm>({
        defaultValues: {
            priority: 'NORMAL',
            quantity: 1
        }
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: CreateRequisitionForm) => {
        setLoading(true);
        try {
            // Default to type ID 1 for now
            const payload = { ...data, requisitionTypeId: 1 };
            await dashboardAPI.createRequisition(payload);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create requisition');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
                Dashboard
            </Button>

            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={0} variant="outlined">
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    New Requisition
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Fill in the details below to submit a new purchase request.
                </Typography>
                <Divider sx={{ mb: 4 }} />

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        {/* Core Info */}
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Material Description"
                                placeholder="E.g., 50 bags of Cement"
                                {...register('materialDescription', { required: 'Material description is required' })}
                                error={!!errors.materialDescription}
                                helperText={errors.materialDescription?.message}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                fullWidth
                                label="Priority"
                                defaultValue="NORMAL"
                                {...register('priority')}
                                InputLabelProps={{ shrink: true }}
                            >
                                <MenuItem value="LOW">Low</MenuItem>
                                <MenuItem value="NORMAL">Normal</MenuItem>
                                <MenuItem value="HIGH">High</MenuItem>
                                <MenuItem value="URGENT">Urgent</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Site Address / Location"
                                {...register('siteAddress', { required: 'Site is required' })}
                                error={!!errors.siteAddress}
                                helperText={errors.siteAddress?.message}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                {...register('quantity', { required: true, min: 1 })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Est. Amount (₹)"
                                {...register('amount', { required: true, min: 0 })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Additional Details Header */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                ADDITIONAL DETAILS (OPTIONAL)
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Required For" placeholder="e.g. Foundation work" {...register('requiredFor')} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Vendor Name" {...register('vendorName')} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="PO Details" {...register('poDetails')} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Indent No" {...register('indentNo')} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Additional Notes"
                                {...register('description')}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button variant="text" onClick={() => navigate('/dashboard')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<SendIcon />}
                                    disabled={loading}
                                    sx={{ px: 4 }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateRequisition;
