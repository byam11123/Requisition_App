import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { dashboardAPI } from '../services/api';
import {
    Container, Grid, Paper, Typography, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Box, Card, CardContent, Stack, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    LocalShipping as DispatchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PendingActions,
    CheckCircle,
    AttachMoney,
    ReceiptLong,
    ChevronRight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    draftCount: number;
    pendingCount: number;
    approvedCount: number;
    paidCount: number;
    rejectedCount: number;
    totalCount: number;
}

interface RequisitionCard {
    id: number;
    requestId: string;
    description: string;
    amount: number;
    status: string;
    approvalStatus: string;
    paymentStatus: string;
    dispatchStatus: string;
    priority: string;
    siteAddress: string;
    vendorName: string;
    createdByName: string;
    createdAt: string;
    cardSubtitleInfo: string;
    materialDescription?: string;
}

const Dashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [requisitions, setRequisitions] = useState<RequisitionCard[]>([]);
    const [loading, setLoading] = useState(true);

    const DEFAULT_TYPE_ID = 1;

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, reqRes] = await Promise.all([
                dashboardAPI.getStats(DEFAULT_TYPE_ID),
                dashboardAPI.getRequisitionsByType(DEFAULT_TYPE_ID)
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (reqRes.data.success) setRequisitions(reqRes.data.data);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to mark this as dispatched?")) return;
        try {
            await dashboardAPI.dispatchRequisition(id);
            loadDashboardData();
        } catch (error) {
            console.error("Dispatch failed", error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this requisition?')) {
            try {
                // Ideally use an API client method
                await fetch(`${import.meta.env.VITE_API_URL}/requisitions/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                loadDashboardData();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'error';
            case 'PAID': return 'info';
            default: return 'default';
        }
    };

    // Helper for Priority Color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'error';
            case 'HIGH': return 'warning';
            case 'LOW': return 'info';
            default: return 'default'; // NORMAL
        }
    };

    const StatCard = ({ title, count, icon, color }: any) => (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: `${color}.light`,
                opacity: 0.2
            }} />
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography color="textSecondary" variant="body2" fontWeight="bold">
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                            {count}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main` }}>
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">
                    Dashboard
                </Typography>
                {user?.role === 'PURCHASER' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/create')}
                        size={isMobile ? "medium" : "large"}
                    >
                        New Requisition
                    </Button>
                )}
            </Box>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={2} mb={4}>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="Pending" count={stats.pendingCount} icon={<PendingActions />} color="warning" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="Approved" count={stats.approvedCount} icon={<CheckCircle />} color="success" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="To Pay" count={stats.approvedCount - stats.paidCount} icon={<AttachMoney />} color="info" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="Total" count={stats.totalCount} icon={<ReceiptLong />} color="secondary" />
                    </Grid>
                </Grid>
            )}

            <Typography variant="h6" fontWeight="bold" mb={2}>Recent Requisitions</Typography>

            {/* Mobile List View */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Stack spacing={2}>
                    {requisitions.map((row) => (
                        <Card
                            key={row.id}
                            onClick={() => navigate(`/requisitions/${row.id}`)}
                            sx={{ cursor: 'pointer', '&:active': { bgcolor: 'action.hover' } }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={1}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">{row.requestId}</Typography>
                                        <Typography variant="caption" color="text.secondary">{row.createdAt}</Typography>
                                    </Box>
                                    <Stack direction="column" alignItems="end" spacing={0.5}>
                                        <Chip
                                            label={row.approvalStatus}
                                            color={getStatusColor(row.approvalStatus) as any}
                                            size="small"
                                        />
                                        {row.priority && row.priority !== 'NORMAL' && (
                                            <Chip label={row.priority} color={getPriorityColor(row.priority) as any} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                        )}
                                    </Stack>
                                </Stack>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>{row.materialDescription || row.description}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                    Site: {row.siteAddress || 'N/A'}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" color="primary">₹{row.amount?.toLocaleString()}</Typography>
                                    <Stack direction="row">
                                        {/* Edit Action: Manager (if not PAID) OR Purchaser (if PENDING) */}
                                        {((user?.role === 'MANAGER' && row.paymentStatus !== 'DONE') ||
                                            (user?.role === 'PURCHASER' && row.approvalStatus === 'PENDING') ||
                                            (user?.role === 'ADMIN' && row.paymentStatus !== 'DONE')) && (
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${row.id}`); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        <ChevronRight color="action" />
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                    {requisitions.length === 0 && !loading && (
                        <Typography align="center" color="text.secondary">No requisitions found</Typography>
                    )}
                </Stack>
            </Box>

            {/* Desktop Table View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="requisitions table">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Item & Site</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created By</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Approval</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Dispatch</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requisitions.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: '600', color: 'primary.main' }}>
                                        {row.requestId}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.priority || 'NORMAL'}
                                            color={getPriorityColor(row.priority) as any}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant="body2" fontWeight="medium">{row.description}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.siteAddress || 'No Site'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant="body2">{row.createdByName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.createdAt}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>₹{row.amount?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.approvalStatus}
                                            color={getStatusColor(row.approvalStatus) as any}
                                            size="small"
                                            variant={row.approvalStatus === 'PENDING' ? 'outlined' : 'filled'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.paymentStatus}
                                            size="small"
                                            variant="outlined"
                                            color={row.paymentStatus === 'DONE' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.dispatchStatus}
                                            color={row.dispatchStatus === 'DISPATCHED' ? 'success' : 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            title="View Details"
                                            onClick={() => navigate(`/requisitions/${row.id}`)}
                                        >
                                            <ViewIcon />
                                        </IconButton>

                                        {/* Edit Action: Manager (if not PAID) OR Purchaser (if PENDING) */}
                                        {((user?.role === 'MANAGER' && row.paymentStatus !== 'DONE') ||
                                            (user?.role === 'PURCHASER' && row.approvalStatus === 'PENDING') ||
                                            (user?.role === 'ADMIN' && row.paymentStatus !== 'DONE')) && (
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    title="Edit"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/edit/${row.id}`); }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            )}

                                        {/* Delete Action: Manager (if not PAID) OR Purchaser (if PENDING) */}
                                        {((user?.role === 'MANAGER' && row.paymentStatus !== 'DONE') ||
                                            (user?.role === 'PURCHASER' && row.approvalStatus === 'PENDING') ||
                                            (user?.role === 'ADMIN' && row.paymentStatus !== 'DONE')) && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    title="Delete"
                                                    onClick={(e) => handleDelete(e, row.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}

                                        {/* Dispatch Action: Purchaser only, after Approval */}
                                        {user?.role === 'PURCHASER' &&
                                            row.dispatchStatus === 'NOT_DISPATCHED' &&
                                            row.approvalStatus === 'APPROVED' && (
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    title="Mark as Dispatched"
                                                    onClick={(e) => handleDispatch(e, row.id)}
                                                >
                                                    <DispatchIcon />
                                                </IconButton>
                                            )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {requisitions.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">No requisitions found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default Dashboard;
