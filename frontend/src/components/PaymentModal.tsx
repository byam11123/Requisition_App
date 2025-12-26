import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Box,
    Typography
} from '@mui/material';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any, file: File | null) => void;
    loading: boolean;
    requisitionAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, onSubmit, loading, requisitionAmount }) => {
    const [paymentStatus, setPaymentStatus] = useState('DONE');
    const [utrNo, setUtrNo] = useState('');
    const [paymentMode, setPaymentMode] = useState('UPI');
    // Initialize with current date in YYYY-MM-DD format
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState<number>(requisitionAmount);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!utrNo) {
            setError('Please enter UTR Number');
            return;
        }
        if (!amount) {
            setError('Please enter amount');
            return;
        }

        const data = {
            paymentStatus,
            utrNo,
            paymentMode,
            paymentDate: new Date(paymentDate).toISOString(),
            amount
        };
        onSubmit(data, file);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Update Payment Details</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <FormControl fullWidth margin="normal">
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        value={paymentStatus}
                        label="Payment Status"
                        onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                        <MenuItem value="DONE">Done</MenuItem>
                        <MenuItem value="PARTIAL">Partial</MenuItem>
                        <MenuItem value="NOT_DONE">Not Done</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="UTR Number"
                        value={utrNo}
                        onChange={(e) => setUtrNo(e.target.value)}
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Mode</InputLabel>
                        <Select
                            value={paymentMode}
                            label="Mode"
                            onChange={(e) => setPaymentMode(e.target.value)}
                        >
                            <MenuItem value="UPI">UPI</MenuItem>
                            <MenuItem value="NEFT">NEFT</MenuItem>
                            <MenuItem value="RTGS">RTGS</MenuItem>
                            <MenuItem value="CASH">Cash</MenuItem>
                            <MenuItem value="CHEQUE">Cheque</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Payment Date"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Amount Paid"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                </Box>

                <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>Upload Payment Proof (Screenshot/Photo)</Typography>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="payment-proof-file"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="payment-proof-file">
                        <Button variant="outlined" component="span">
                            Choose File
                        </Button>
                    </label>
                    {file && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Selected: {file.name}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="success"
                    disabled={loading}
                >
                    {loading ? 'Update Payment' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentModal;
