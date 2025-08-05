import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
    signIn as cognitoSignIn,
    signOutGlobal,
    getTokens,
    getAccessToken,
    refreshTokens,
    clearSession,
    completeNewPasswordChallenge,
    TokenSet, configureCognito
} from "../utils/cognitoService";

interface AuthContextProps {
    user: any;
    signIn: (username: string, password: string) => Promise<void>;
    completePasswordChange: (newPassword: string) => Promise<void>;
    signOut: () => Promise<void>;
    getAccessToken: () => string | undefined;
    authStep: "login" | "newPassword" | "authenticated";
}

interface AuthProviderProps {
    children: React.ReactNode;
    config: {
        AWS_REGION: string;
        USER_POOL_CLIENT_ID: string;
        IDENTITY_POOL_ID: string;
    };
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, config }) => {
    const [user, setUser] = useState<any>(() => {
        const token = getAccessToken();
        return token ? jwtDecode(token) : null;
    });

    const [authStep, setAuthStep] = useState<"login" | "newPassword" | "authenticated">(
        user ? "authenticated" : "login"
    );
    const [sessionData, setSessionData] = useState<{ session: string; username: string } | null>(null);

    useEffect(() => {
        configureCognito({
            region: config.AWS_REGION,
            clientId: config.USER_POOL_CLIENT_ID,
        });
    }, [config]);

    // --- Refresh token automatically ---
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        async function scheduleRefresh() {
            const tokens = getTokens();
            if (!tokens?.accessToken) return;

            const decoded: any = jwtDecode(tokens.accessToken);
            const expiresAt = decoded.exp * 1000;
            const refreshAt = expiresAt - 5 * 60 * 1000; // refresh 5 minutes before expiry
            const delay = Math.max(refreshAt - Date.now(), 0);

            if (interval) clearTimeout(interval);
            interval = setTimeout(async () => {
                try {
                    const newTokens = await refreshTokens();
                    setUser(jwtDecode(newTokens.accessToken));
                    scheduleRefresh(); // reschedule next refresh
                } catch (err) {
                    console.error("Failed to refresh token", err);
                    await signOut();
                }
            }, delay);
        }

        scheduleRefresh();

        return () => {
            if (interval) clearTimeout(interval);
        };
    }, [user]);


    async function signIn(username: string, password: string) {
        const response = await cognitoSignIn(username, password);

        if ("challengeName" in response && response.challengeName === "NEW_PASSWORD_REQUIRED") {
            setSessionData({ session: response.session!, username: response.username });
            setAuthStep("newPassword");
        } else {
            // Now TypeScript knows this is the token response
            setUser(jwtDecode((response as TokenSet).accessToken));
            setAuthStep("authenticated");
        }
    }


    async function completePasswordChange(newPassword: string) {
        if (!sessionData) throw new Error("No session data");
        const tokens = await completeNewPasswordChallenge(sessionData.username, newPassword, sessionData.session);
        setUser(jwtDecode(tokens.accessToken));
        setSessionData(null);
        setAuthStep("authenticated");
    }


    async function signOut() {
        await signOutGlobal();
        clearSession();
        setUser(null);
        setAuthStep("login");
    }

    return (
        <AuthContext.Provider value={{ user, signIn, completePasswordChange, signOut, getAccessToken, authStep }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext)!;
}
