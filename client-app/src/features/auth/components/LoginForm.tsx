import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function LoginForm() {
    const { signIn } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await signIn(username, password);
        } catch (err: any) {
            setError(err.message || "Login failed");
        }
    }

    return (
        <Stack height="100vh" justifyContent="center" alignItems="center">
            <form onSubmit={handleSubmit} style={{ maxWidth: '30%', margin: "0 auto" }}>
                <Paper elevation={3} sx={{ padding: 2, minWidth: 500 }}>
                    <Stack gap={2} width="100%">
                        <Typography variant="h4">Sign In</Typography>
                        <TextField                type="text"
                                                  value={username}
                                                  onChange={(e) => setUsername(e.target.value)}
                                                  placeholder="Username"
                                                  required />
                        <TextField
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            fullWidth
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button type="submit" variant="contained">Sign In</Button>
                    </Stack>
                </Paper>
            </form>
        </Stack>
    );
}
