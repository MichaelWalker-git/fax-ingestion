import {Box, Button, Modal, Typography} from "@mui/material";

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    text?: string
    onConfirm?: () => void
}

export default function ConfirmationModal({ open, onClose, text, onConfirm }: ConfirmationModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box
                sx={{ bgcolor: 'background.paper', border: '1px solid #000', p: 4 }}
                display="flex"
                flexDirection="column"
                gap={2}
            >
                <Typography id="modal-modal-title" variant="h6" component="h2">Confirmation</Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>{text || 'Are you sure you want to delete this item?'}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={onConfirm} sx={{ ml: 2 }}>Confirm</Button>
                </Box>
            </Box>
        </Modal>
    )
}
