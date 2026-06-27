import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'routefy-super-secret-key-12345';
  return new TextEncoder().encode(secret);
};

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as { merchantId: number; email?: string; phone?: string };
  } catch (error) {
    return null;
  }
}

export async function signJwtToken(payload: { merchantId: number; email?: string; phone?: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 1 week session
    .sign(getJwtSecretKey());
  
  return token;
}

export async function getSessionMerchantId() {
  const token = cookies().get('merchant_session_token')?.value;
  if (token) {
    const payload = await verifyJwtToken(token);
    if (payload?.merchantId) {
      return payload.merchantId;
    }
  }

  // Fallback to old session for backwards compatibility during migration
  const oldSession = cookies().get('merchant_session')?.value;
  if (oldSession && !isNaN(parseInt(oldSession, 10))) {
    return parseInt(oldSession, 10);
  }

  return null;
}
