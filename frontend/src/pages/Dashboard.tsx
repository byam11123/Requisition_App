import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { dashboardAPI, requisitionAPI } from '../services/api';
import {
    Container, Grid, Paper, Typography, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Box, Card, CardContent, Stack, Divider, useTheme, useMediaQuery,
    TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, TablePagination,
    Checkbox
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
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon,
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

type StatFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'TOPAY';

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
    const [filteredRequisitions, setFilteredRequisitions] = useState<RequisitionCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
    const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [exporting, setExporting] = useState(false);
    const [activeStatFilter, setActiveStatFilter] = useState<StatFilter>('ALL');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleting, setDeleting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await requisitionAPI.exportRequisitions();

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Requisition_Report.xlsx'); // or extract from header
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export Excel file. Please try again.");
        } finally {
            setExporting(false);
        }
    };

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
            if (reqRes.data.success) {
                setRequisitions(reqRes.data.data);
                setFilteredRequisitions(reqRes.data.data);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter requisitions based on search and filters
    useEffect(() => {
        let filtered = requisitions;

        // Quick filters from stat cards
        if (activeStatFilter === 'PENDING') {
            filtered = filtered.filter(req => req.approvalStatus === 'PENDING');
        } else if (activeStatFilter === 'APPROVED') {
            filtered = filtered.filter(req => req.approvalStatus === 'APPROVED');
        } else if (activeStatFilter === 'TOPAY') {
            // Approved but payment not completed
            filtered = filtered.filter(req => req.approvalStatus === 'APPROVED' && req.paymentStatus !== 'DONE');
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(req =>
                req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.siteAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.createdByName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Approval status filter
        if (approvalFilter !== 'ALL') {
            filtered = filtered.filter(req => req.approvalStatus === approvalFilter);
        }

        // Priority filter
        if (priorityFilter !== 'ALL') {
            filtered = filtered.filter(req => req.priority === priorityFilter);
        }

        setFilteredRequisitions(filtered);
        setPage(0); // Reset to first page when filters change
        setSelectedIds([]); // Clear selections when filter set changes
    }, [searchQuery, approvalFilter, priorityFilter, requisitions, activeStatFilter]);

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
                await requisitionAPI.delete(id);
                setSelectedIds(prev => prev.filter(x => x !== id));
                loadDashboardData();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    // Bulk delete for admin (typically for COMPLETED requisitions)
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected requisitions?`)) {
            return;
        }
        try {
            setDeleting(true);
            await Promise.all(selectedIds.map(id => requisitionAPI.delete(id)));
            setSelectedIds([]);
            loadDashboardData();
        } catch (error) {
            console.error('Bulk delete failed', error);
            alert('Failed to delete some requisitions. Please try again.');
        } finally {
            setDeleting(false);
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

    const StatCard = ({ title, count, icon, color, selected = false, onClick }: any) => (
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: selected ? `${color}.main` : 'transparent',
                boxShadow: selected ? 4 : 1,
            }}
        >
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

    // Visible rows for current page (used for header checkbox state)
    const paginatedRequisitions = filteredRequisitions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const visibleIds = paginatedRequisitions.map(r => r.id);
    const allSelectedVisible = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    const someSelectedVisible = visibleIds.some(id => selectedIds.includes(id));

    const toggleRowSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAllVisible = () => {
        if (allSelectedVisible) {
            // Unselect all visible
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            // Select all visible (merge with existing)
            setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">
                    Dashboard
                </Typography>
                <Stack direction="row" spacing={2}>
                    {user?.role === 'ADMIN' && selectedIds.length > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? 'Exporting...' : 'Export Excel'}
                    </Button>
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
                </Stack>
            </Box>

            {/* Stats Cards (clickable filters) */}
            {stats && (
                <Grid container spacing={2} mb={4}>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard
                            title="Pending"
                            count={stats.pendingCount}
                            icon={<PendingActions />}
                            color="warning"
                            selected={activeStatFilter === 'PENDING'}
                            onClick={() => {
                                setActiveStatFilter(prev => prev === 'PENDING' ? 'ALL' : 'PENDING');
                                setApprovalFilter('PENDING');
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard
                            title="Approved"
                            count={stats.approvedCount}
                            icon={<CheckCircle />}
                            color="success"
                            selected={activeStatFilter === 'APPROVED'}
                            onClick={() => {
                                setActiveStatFilter(prev => prev === 'APPROVED' ? 'ALL' : 'APPROVED');
                                setApprovalFilter('APPROVED');
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard
                            title="To Pay"
                            count={stats.approvedCount - stats.paidCount}
                            icon={<AttachMoney />}
                            color="info"
                            selected={activeStatFilter === 'TOPAY'}
                            onClick={() => {
                                setActiveStatFilter(prev => prev === 'TOPAY' ? 'ALL' : 'TOPAY');
                                // For "To Pay" we show approved but not fully paid; keep dropdown on ALL
                                setApprovalFilter('ALL');
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard
                            title="Total"
                            count={stats.totalCount}
                            icon={<ReceiptLong />}
                            color="secondary"
                            selected={activeStatFilter === 'ALL'}
                            onClick={() => {
                                setActiveStatFilter('ALL');
                                setApprovalFilter('ALL');
                            }}
                        />
                    </Grid>
                </Grid>
            )}

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by ID, description, site, vendor, or creator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Approval Status</InputLabel>
                            <Select
                                value={approvalFilter}
                                label="Approval Status"
                                onChange={(e) => setApprovalFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Statuses</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="APPROVED">Approved</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={priorityFilter}
                                label="Priority"
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Priorities</MenuItem>
                                <MenuItem value="URGENT">Urgent</MenuItem>
                                <MenuItem value="HIGH">High</MenuItem>
                                <MenuItem value="NORMAL">Normal</MenuItem>
                                <MenuItem value="LOW">Low</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            {filteredRequisitions.length} results
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h6" fontWeight="bold" mb={2}>Recent Requisitions</Typography>

            {/* Mobile List View */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Stack spacing={2}>
                    {filteredRequisitions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
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
                                        <Stack direction="row" spacing={0.5}>
                                            {/* Edit Action: Manager (if not PAID) OR Purchaser (if PENDING) OR Admin (if not PAID) */}
                                            {((user?.role === 'MANAGER' && row.paymentStatus !== 'DONE') ||
                                                (user?.role === 'PURCHASER' && row.approvalStatus === 'PENDING') ||
                                                (user?.role === 'ADMIN' && row.paymentStatus !== 'DONE')) && (
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${row.id}`); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {/* Delete Action: same rules as desktop */}
                                            {((user?.role === 'MANAGER' && row.paymentStatus !== 'DONE') ||
                                                (user?.role === 'PURCHASER' && row.approvalStatus === 'PENDING') ||
                                                (user?.role === 'ADMIN' && row.paymentStatus !== 'DONE')) && (
                                                <IconButton size="small" color="error" onClick={(e) => handleDelete(e, row.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <ChevronRight color="action" />
                                        </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredRequisitions.length === 0 && !loading && (
                        <Typography align="center" color="text.secondary">No requisitions found</Typography>
                    )}
                </Stack>
                {filteredRequisitions.length > 0 && (
                    <TablePagination
                        component="div"
                        count={filteredRequisitions.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                )}
            </Box>

            {/* Desktop Table View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="requisitions table">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                {user?.role === 'ADMIN' && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={someSelectedVisible && !allSelectedVisible}
                                            checked={allSelectedVisible}
                                            onChange={toggleSelectAllVisible}
                                        />
                                    </TableCell>
                                )}
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
                            {paginatedRequisitions.map((row) => {
                                const isCompleted = row.status === 'COMPLETED';
                                const rowSelected = selectedIds.includes(row.id);
                                const canAdminSelect = user?.role === 'ADMIN' && isCompleted;

                                return (
                                    <TableRow key={row.id} hover>
                                        {user?.role === 'ADMIN' && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    disabled={!canAdminSelect}
                                                    checked={rowSelected}
                                                    onChange={() => toggleRowSelection(row.id)}
                                                />
                                            </TableCell>
                                        )}
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
                            );
                            })}
                            {filteredRequisitions.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">No requisitions found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {filteredRequisitions.length > 0 && (
                    <TablePagination
                        component="div"
                        count={filteredRequisitions.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                )}
            </Box>
        </Container>
    );
};

export default Dashboard;
