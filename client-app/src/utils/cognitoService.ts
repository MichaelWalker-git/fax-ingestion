// src/services/cognitoService.ts
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    GlobalSignOutCommand,
    RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// TODO
// const client = new CognitoIdentityProviderClient({ region: "us-east-2" }); // replace region
const TOKEN_KEY = "cognito-tokens";
let CLIENT_ID = "";
let REGION = "";




export function configureCognito({ region, clientId }: { region: string; clientId: string }) {
    CLIENT_ID = clientId;
    REGION = region;
}

function getClient() {
    return new CognitoIdentityProviderClient({ region: REGION });
}

export type TokenSet = {
    accessToken: string;
    idToken: string;
    refreshToken: string;
};

export type NewPasswordChallenge = {
    challengeName: "NEW_PASSWORD_REQUIRED";
    session: string | undefined;
    username: string;
};

export type SignInResponse = TokenSet | NewPasswordChallenge;

export async function signIn(username: string, password: string): Promise<SignInResponse> {
    const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: { USERNAME: username, PASSWORD: password },
    });

    const client = getClient();
    const response = await client.send(command);

    // Check for NEW_PASSWORD_REQUIRED
    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
        return {
            challengeName: response.ChallengeName,
            session: response.Session,
            username,
        };
    }

    if (!response.AuthenticationResult) throw new Error("Login failed");

    const tokens = {
        accessToken: response.AuthenticationResult.AccessToken!,
        idToken: response.AuthenticationResult.IdToken!,
        refreshToken: response.AuthenticationResult.RefreshToken!,
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    return tokens;
}

export function getTokens() {
    const tokens = localStorage.getItem(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
}

export function getAccessToken() {
    return getTokens()?.accessToken;
}

export async function refreshTokens() {
    const tokens = getTokens();
    if (!tokens?.refreshToken) throw new Error("No refresh token");

    const command = new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
            REFRESH_TOKEN: tokens.refreshToken,
        },
    });

    const client = getClient();

    const response = await client.send(command);
    if (!response.AuthenticationResult) throw new Error("Failed to refresh token");

    const newTokens = {
        accessToken: response.AuthenticationResult.AccessToken!,
        idToken: response.AuthenticationResult.IdToken || tokens.idToken, // idToken may not always be returned
        refreshToken: tokens.refreshToken, // keep the old refresh token
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
    return newTokens;
}

export async function signOutGlobal() {
    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    const client = getClient();
    await client.send(new GlobalSignOutCommand({ AccessToken: tokens.accessToken }));
    localStorage.removeItem(TOKEN_KEY);
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
}


export async function completeNewPasswordChallenge(
    username: string,
    newPassword: string,
    session: string
) {
    const command = new RespondToAuthChallengeCommand({
        ClientId: CLIENT_ID,
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        Session: session,
        ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: newPassword,
        },
    });

    const client = getClient();
    const response = await client.send(command);
    if (!response.AuthenticationResult) throw new Error("Failed to set new password");

    const tokens = {
        accessToken: response.AuthenticationResult.AccessToken!,
        idToken: response.AuthenticationResult.IdToken!,
        refreshToken: response.AuthenticationResult.RefreshToken!,
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    return tokens;
}
