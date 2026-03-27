import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { sql } from "./db";

const RP_NAME = "RepurposeAI";
const RP_ID = process.env.WEBAUTHN_RP_ID || (process.env.NODE_ENV === "production" ? "repurpose-ai.app" : "localhost");
const ORIGIN = process.env.WEBAUTHN_ORIGIN || (process.env.NODE_ENV === "production" ? "https://repurpose-ai.app" : "http://localhost:3000");
const CHALLENGE_TTL_MINUTES = 5;
const LOGIN_TOKEN_TTL_SECONDS = 30;

// --- DB Helpers ---

async function saveChallenge(challenge: string, type: string, email?: string): Promise<void> {
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000);
  await sql`
    INSERT INTO webauthn_challenges (challenge, email, type, expires_at)
    VALUES (${challenge}, ${email ?? null}, ${type}, ${expiresAt})
  `;
}

async function getAndDeleteChallenge(challenge: string, type: string, email?: string): Promise<boolean> {
  const rows = email
    ? await sql`
        DELETE FROM webauthn_challenges
        WHERE challenge = ${challenge} AND type = ${type} AND email = ${email} AND expires_at > NOW()
        RETURNING id
      `
    : await sql`
        DELETE FROM webauthn_challenges
        WHERE challenge = ${challenge} AND type = ${type} AND expires_at > NOW()
        RETURNING id
      `;
  return rows.length > 0;
}

export async function getPasskeysByEmail(email: string) {
  return sql`
    SELECT credential_id, public_key, counter, device_type, backed_up, transports, name, created_at
    FROM passkeys WHERE user_email = ${email}
    ORDER BY created_at DESC
  `;
}

async function getPasskeyByCredentialId(credentialId: string) {
  const rows = await sql`
    SELECT credential_id, user_email, public_key, counter, device_type, backed_up, transports
    FROM passkeys WHERE credential_id = ${credentialId}
  `;
  return rows.length > 0 ? rows[0] : null;
}

async function savePasskey(data: {
  credential_id: string;
  user_email: string;
  public_key: string;
  counter: number;
  device_type: string;
  backed_up: boolean;
  transports: string;
  name: string;
}): Promise<void> {
  await sql`
    INSERT INTO passkeys (credential_id, user_email, public_key, counter, device_type, backed_up, transports, name)
    VALUES (${data.credential_id}, ${data.user_email}, ${data.public_key}, ${data.counter}, ${data.device_type}, ${data.backed_up}, ${data.transports}, ${data.name})
  `;
}

async function updatePasskeyCounter(credentialId: string, newCounter: number): Promise<void> {
  await sql`UPDATE passkeys SET counter = ${newCounter} WHERE credential_id = ${credentialId}`;
}

export async function deletePasskey(credentialId: string, userEmail: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM passkeys WHERE credential_id = ${credentialId} AND user_email = ${userEmail} RETURNING credential_id
  `;
  return rows.length > 0;
}

// --- WebAuthn Operations ---

export async function createRegistrationOptions(email: string) {
  const existingPasskeys = await getPasskeysByEmail(email);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: email,
    userDisplayName: email.split("@")[0],
    excludeCredentials: existingPasskeys.map((pk) => ({
      id: pk.credential_id,
      transports: pk.transports ? (pk.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    attestationType: "none",
  });

  await saveChallenge(options.challenge, "registration", email);
  return options;
}

export async function verifyRegistration(
  response: RegistrationResponseJSON,
  email: string,
  passkeyName?: string,
) {
  const expectedChallenge = async (challenge: string) => {
    return getAndDeleteChallenge(challenge, "registration", email);
  };

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return { verified: false as const };
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  await savePasskey({
    credential_id: credential.id,
    user_email: email,
    public_key: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter,
    device_type: credentialDeviceType,
    backed_up: credentialBackedUp,
    transports: credential.transports?.join(",") ?? "",
    name: passkeyName || "Passkey",
  });

  return { verified: true as const, credentialId: credential.id };
}

export async function createAuthenticationOptions() {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
  });

  await saveChallenge(options.challenge, "authentication");
  return options;
}

export async function verifyAuthentication(response: AuthenticationResponseJSON) {
  const passkey = await getPasskeyByCredentialId(response.id);
  if (!passkey) return null;

  const expectedChallenge = async (challenge: string) => {
    return getAndDeleteChallenge(challenge, "authentication");
  };

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: passkey.credential_id,
      publicKey: isoBase64URL.toBuffer(passkey.public_key),
      counter: Number(passkey.counter),
      transports: passkey.transports ? (passkey.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) return null;

  await updatePasskeyCounter(passkey.credential_id, verification.authenticationInfo.newCounter);

  // Create one-time login token for the Credentials provider
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  const token = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_SECONDS * 1000);
  await sql`
    INSERT INTO webauthn_challenges (challenge, email, type, expires_at)
    VALUES (${token}, ${passkey.user_email}, ${"login-token"}, ${expiresAt})
  `;

  return { userEmail: passkey.user_email, token };
}

export async function consumeLoginToken(token: string): Promise<string | null> {
  const rows = await sql`
    DELETE FROM webauthn_challenges
    WHERE challenge = ${token} AND type = ${"login-token"} AND expires_at > NOW()
    RETURNING email
  `;
  return rows.length > 0 ? rows[0].email : null;
}
