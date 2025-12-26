import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Container, Paper, Typography, Button, Box, Grid, Chip,
    CircularProgress, Divider, Stack, Stepper, Step, StepLabel,
    Card, CardContent, StepContent, useTheme, useMediaQuery
} from '@mui/material';
import { ArrowBack as BackIcon, Payment, CloudUpload } from '@mui/icons-material';
import { requisitionAPI } from '../services/api';
import { RootState } from '../store/store';
import ApprovalModal from '../components/ApprovalModal';
import PaymentModal from '../components/PaymentModal';

interface RequisitionDetail {
    id: number;
    requestId: string;
    type: string;
    description: string;
    amount: number;
    status: string;
    approvalStatus: string;
    paymentStatus: string;
    dispatchStatus: string;
    siteAddress: string;
    materialDescription: string;
    quantity: number;
    poDetails: string;
    requiredFor: string;
    vendorName: string;
    indentNo: string;
    priority: string;
    createdByName: string;
    createdAt: string;
    paymentUtrNo?: string;
    paymentMode?: string;
    paymentDate?: string;
    paymentAmount?: number;
    paymentPhotoUrl?: string;
    materialPhotoUrl?: string;
    billPhotoUrl?: string;
    approvalNotes?: string;
    materialReceived?: boolean;
    receiptNotes?: string;
    createdBy: { id: number };
    approvedAt?: string;
    paidAt?: string;
    dispatchedAt?: string;
}

const steps = ['Submitted', 'Approved', 'Paid', 'Dispatched'];

const ViewRequisition: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [requisition, setRequisition] = useState<RequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        loadRequisition();
    }, [id]);

    const loadRequisition = async () => {
        try {
            const response = await requisitionAPI.getById(Number(id));
            if (response.data.success) {
                setRequisition(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load requisition', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (status: string, notes: string) => {
        if (!requisition) return;
        setModalLoading(true);
        try {
            await requisitionAPI.approve(requisition.id, { approvalStatus: status, notes });
            await loadRequisition();
            setApprovalModalOpen(false);
        } catch (error) {
            console.error('Approval failed', error);
        } finally {
            setModalLoading(false);
        }
    };

    const handlePaymentUpdate = async (data: any, file: File | null) => {
        if (!requisition) return;
        setModalLoading(true);
        try {
            await requisitionAPI.updatePayment(requisition.id, data);
            if (file) {
                await requisitionAPI.uploadFile(requisition.id, file, 'payment');
            }
            await loadRequisition();
            setPaymentModalOpen(false);
        } catch (error) {
            console.error('Payment update failed', error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDispatch = async () => {
        if (!requisition) return;
        if (!window.confirm('Are you sure you want to mark this as Dispatched?')) return;
        try {
            await requisitionAPI.dispatch(requisition.id);
            await loadRequisition();
        } catch (error) {
            console.error("Dispatch failed", error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'material' | 'bill') => {
        if (!requisition || !event.target.files?.[0]) return;
        try {
            setLoading(true);
            await requisitionAPI.uploadFile(requisition.id, event.target.files[0], type);
            await loadRequisition();
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Active Step
    const getActiveStep = (req: RequisitionDetail) => {
        if (req.dispatchStatus === 'DISPATCHED') return 4;
        if (req.paymentStatus === 'DONE') return 3;
        if (req.approvalStatus === 'APPROVED') return 2;
        if (req.approvalStatus === 'REJECTED') return 1; // Special case handling needed ideally
        return 1;
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (!requisition) return <Typography>Not Found</Typography>;

    const activeStep = getActiveStep(requisition);
    const canApprove = user?.role === 'MANAGER' || user?.role === 'ADMIN';
    const canPay = (user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN') && requisition.approvalStatus === 'APPROVED';
    const canUploadBill = canApprove || canPay;

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
                Dashboard
            </Button>

            <Grid container spacing={3}>
                {/* Main Content Info */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Requisition ID</Typography>
                                <Typography variant="h5" fontWeight="bold">{requisition.requestId}</Typography>
                            </Box>
                            <Chip
                                label={requisition.status}
                                color={requisition.status === 'APPROVED' ? 'success' : 'primary'}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        <Box mb={3}>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {requisition.description}
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Amount</Typography>
                                <Typography variant="h6">₹{requisition.amount?.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Created By</Typography>
                                <Typography variant="body1">{requisition.createdByName}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Site Address</Typography>
                                <Typography variant="body1">{requisition.siteAddress || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Required For</Typography>
                                <Typography variant="body1">{requisition.requiredFor || 'N/A'}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Typography variant="caption" color="text.secondary">Vendor</Typography>
                                <Typography variant="body1">{requisition.vendorName || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Typography variant="caption" color="text.secondary">PO Details</Typography>
                                <Typography variant="body1">{requisition.poDetails || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Typography variant="caption" color="text.secondary">Indent No</Typography>
                                <Typography variant="body1">{requisition.indentNo || '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Attachments Section */}
                    <Paper sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                        <Typography variant="h6" gutterBottom>Attachments</Typography>
                        <Grid container spacing={2}>
                            {[
                                { title: 'Bill/Invoice', url: requisition.billPhotoUrl, type: 'bill' },
                                { title: 'Payment Proof', url: requisition.paymentPhotoUrl, type: 'payment' },
                                { title: 'Material', url: requisition.materialPhotoUrl, type: 'material' }
                            ].map((item: any) => (
                                item.url ? (
                                    <Grid item xs={6} sm={4} key={item.title}>
                                        <Card variant="outlined">
                                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                <Typography variant="caption" display="block" align="center" gutterBottom>{item.title}</Typography>
                                                <Box
                                                    component="img"
                                                    src={`${import.meta.env.VITE_API_URL}${item.url.replace('/api/v1', '')}`}
                                                    sx={{ width: '100%', height: 100, objectFit: 'contain', cursor: 'pointer' }}
                                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}${item.url.replace('/api/v1', '')}`, '_blank')}
                                                />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ) : null
                            ))}
                            {/* Upload Button Placeholder if needed */}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Sidebar: Status & Actions */}
                <Grid item xs={12} md={4}>
                    {/* Actions Card */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                        <Typography variant="h6" gutterBottom>Actions</Typography>
                        <Stack spacing={2}>
                            {canApprove && requisition.approvalStatus === 'PENDING' && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setApprovalModalOpen(true)}
                                >
                                    Process Approval
                                </Button>
                            )}
                            {canPay && requisition.paymentStatus !== 'DONE' && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    startIcon={<Payment />}
                                    onClick={() => setPaymentModalOpen(true)}
                                >
                                    Update Payment
                                </Button>
                            )}

                            {/* Dispatch Action - Available to Purchaser only if Approved */}
                            {user?.role === 'PURCHASER' &&
                                requisition.approvalStatus === 'APPROVED' &&
                                requisition.dispatchStatus === 'NOT_DISPATCHED' && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="info"
                                        onClick={handleDispatch}
                                    >
                                        Mark as Dispatched
                                    </Button>
                                )}

                            {/* Bill Upload - Available to Purchaser, Manager, Accountant, Admin */}
                            {(user?.role === 'PURCHASER' || user?.role === 'MANAGER' || user?.role === 'ACCOUNTANT' || user?.role === 'ADMIN') && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                >
                                    Upload Bill/Invoice
                                    <input type="file" hidden onChange={(e) => handleFileUpload(e, 'bill')} />
                                </Button>
                            )}

                            {/* Material Upload - Available to Purchaser, Manager, Admin */}
                            {(user?.role === 'PURCHASER' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{ mt: 1 }}
                                >
                                    Upload Material Proof
                                    <input type="file" hidden onChange={(e) => handleFileUpload(e, 'material')} />
                                </Button>
                            )}
                        </Stack>
                        {/* If no actions available */}
                        {!canApprove && !canPay && user?.role === 'ACCOUNTANT' && (
                            <Typography variant="body2" color="text.secondary" align="center">No actions available</Typography>
                        )}
                    </Paper>

                    {/* Timeline */}
                    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                        <Typography variant="h6" gutterBottom>Status Timeline</Typography>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((label, index) => {
                                let dateStr = '';
                                let extraInfo = '';

                                const formatDate = (date: string) => {
                                    if (!date) return '';
                                    // Append 'Z' to force UTC interpretation if not present
                                    const utcDate = date.endsWith('Z') ? date : date + 'Z';
                                    return new Date(utcDate).toLocaleString();
                                };

                                if (index === 0 && requisition.createdAt) {
                                    dateStr = formatDate(requisition.createdAt);
                                } else if (index === 1 && requisition.approvedAt) {
                                    dateStr = formatDate(requisition.approvedAt);
                                    extraInfo = requisition.approvalNotes ? `Note: ${requisition.approvalNotes}` : '';
                                } else if (index === 2 && requisition.paidAt) {
                                    dateStr = formatDate(requisition.paidAt);
                                    extraInfo = requisition.paymentUtrNo ? `UTR: ${requisition.paymentUtrNo}` : '';
                                } else if (index === 3 && requisition.dispatchedAt) {
                                    dateStr = formatDate(requisition.dispatchedAt);
                                }

                                return (
                                    <Step key={label}>
                                        <StepLabel
                                            optional={dateStr ? <Typography variant="caption">{dateStr}</Typography> : null}
                                        >
                                            {label}
                                        </StepLabel>
                                        <StepContent>
                                            <Typography variant="caption" color="text.secondary">
                                                {extraInfo}
                                            </Typography>
                                        </StepContent>
                                    </Step>
                                )
                            })}
                        </Stepper>
                    </Paper>
                </Grid>
            </Grid>

            <ApprovalModal
                open={approvalModalOpen}
                onClose={() => setApprovalModalOpen(false)}
                onSubmit={handleApproval}
                loading={modalLoading}
            />

            <PaymentModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onSubmit={handlePaymentUpdate}
                loading={modalLoading}
                requisitionAmount={requisition.amount}
            />
        </Container>
    );
};

export default ViewRequisition;
