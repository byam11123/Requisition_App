import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, TextField, Box, Grid, CircularProgress, Alert, Divider } from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { requisitionAPI } from '../services/api';

const EditRequisition: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        description: '',
        siteAddress: '',
        materialDescription: '',
        quantity: 0,
        amount: 0,
        poDetails: '',
        requiredFor: '',
        vendorName: '',
        indentNo: '',
        priority: 'NORMAL',
        requisitionTypeId: 1,
    });

    useEffect(() => {
        loadRequisition();
    }, [id]);

    const loadRequisition = async () => {
        try {
            const response = await requisitionAPI.getById(Number(id));
            if (response.data.success) {
                const req = response.data.data;
                setFormData({
                    description: req.description || '',
                    siteAddress: req.siteAddress || '',
                    materialDescription: req.materialDescription || '',
                    quantity: req.quantity || 0,
                    amount: req.amount || 0,
                    poDetails: req.poDetails || '',
                    requiredFor: req.requiredFor || '',
                    vendorName: req.vendorName || '',
                    indentNo: req.indentNo || '',
                    priority: req.priority || 'NORMAL',
                    requisitionTypeId: 1,
                });
            }
        } catch (error) {
            console.error('Failed to load requisition', error);
            setError('Failed to load requisition details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await requisitionAPI.update(Number(id), formData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Update failed', error);
            setError('Failed to update requisition');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
                Dashboard
            </Button>

            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={0} variant="outlined">
                <Typography variant="h5" fontWeight="bold" gutterBottom>Edit Requisition</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Update the details of your requisition below.
                </Typography>
                <Divider sx={{ mb: 4 }} />

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Material Description"
                                value={formData.materialDescription}
                                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Priority"
                                value={formData.priority}
                                disabled // Priority usually set at creation, or add selector if needed
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Site Address"
                                value={formData.siteAddress}
                                onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                ADDITIONAL DETAILS (OPTIONAL)
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Required For"
                                value={formData.requiredFor}
                                onChange={(e) => setFormData({ ...formData, requiredFor: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Vendor Name"
                                value={formData.vendorName}
                                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="PO Details"
                                value={formData.poDetails}
                                onChange={(e) => setFormData({ ...formData, poDetails: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Indent No"
                                value={formData.indentNo}
                                onChange={(e) => setFormData({ ...formData, indentNo: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Additional Notes"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                multiline
                                rows={3}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                                <Button variant="text" onClick={() => navigate('/dashboard')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<SaveIcon />}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default EditRequisition;
