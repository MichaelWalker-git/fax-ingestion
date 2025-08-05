import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function NewPasswordForm() {
    const { completePasswordChange } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await completePasswordChange(newPassword);
        } catch (err: any) {
            setError(err.message || "Password change failed");
        }
    }

    return (
        <Stack height="100vh" justifyContent="center" alignItems="center">
            <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
                <Paper elevation={3} sx={{ padding: 2, minWidth: 500 }}>
                    <Stack gap={2} width="100%">
                        <Typography variant="h4">Create New Password</Typography>
                        <TextField
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            label="New Password"
                            required
                        />
                        <TextField
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            label="Confirm Password"
                            required
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button type="submit" variant="contained">Submit</Button>
                    </Stack>
                </Paper>
            </form>
        </Stack>
    );
}
