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
    Alert
} from '@mui/material';

interface ApprovalModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (status: string, notes: string) => void;
    loading: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ open, onClose, onSubmit, loading }) => {
    const [status, setStatus] = useState('APPROVED');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        onSubmit(status, notes.trim());
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Process Approval</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Decision</InputLabel>
                    <Select
                        value={status}
                        label="Decision"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="APPROVED">Approve</MenuItem>
                        <MenuItem value="REJECTED">Reject</MenuItem>
                        <MenuItem value="HOLD">Hold</MenuItem>
                        <MenuItem value="TO_REVIEW">To Review</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="Notes / Comments"
                    multiline
                    rows={4}
                    margin="normal"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color={status === 'REJECTED' ? 'error' : status === 'APPROVED' ? 'success' : 'primary'}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : status}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApprovalModal;
