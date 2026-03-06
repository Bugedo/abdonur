import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac, timingSafeEqual } from 'crypto';
import { TESTING_MODE } from '@/lib/adminTestingMode';

const ADMIN_SESSION_COOKIE = 'abdonur_admin_session';
const ADMIN_PANEL_PASSWORD = '123456';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export type AdminSession =
  | { role: 'super_admin'; username: 'admin' }
  | { role: 'branch_admin'; username: string; branchId: string; branchSlug: string };

type SessionPayload = AdminSession & { exp: number };

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'dev-admin-session-secret-change-me';
}

function signPayload(rawPayload: string) {
  return createHmac('sha256', getSessionSecret()).update(rawPayload).digest('base64url');
}

function encodePayload(payload: SessionPayload) {
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(raw);
  return `${raw}.${signature}`;
}

function decodePayload(token: string): SessionPayload | null {
  const [raw, receivedSignature] = token.split('.');
  if (!raw || !receivedSignature) return null;

  const expectedSignature = signPayload(raw);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (!parsed.role || !parsed.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createAdminSession(session: AdminSession) {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  cookieStore.set(ADMIN_SESSION_COOKIE, encodePayload(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decodePayload(token);
  if (!payload) return null;

  if (payload.role === 'super_admin') {
    return { role: 'super_admin', username: 'admin' };
  }

  return {
    role: 'branch_admin',
    username: payload.username,
    branchId: payload.branchId,
    branchSlug: payload.branchSlug,
  };
}

export async function requireAdminSession() {
  if (TESTING_MODE) {
    return { role: 'super_admin', username: 'admin' } as const;
  }

  const session = await getAdminSession();
  if (!session) redirect('/admin');
  return session;
}

export async function requireSuperAdmin() {
  if (TESTING_MODE) {
    return { role: 'super_admin', username: 'admin' } as const;
  }

  const session = await requireAdminSession();
  if (session.role !== 'super_admin') {
    if (session.role === 'branch_admin') redirect(`/admin/sucursal/${session.branchSlug}`);
    redirect('/admin');
  }
  return session;
}

export function isValidAdminPassword(password: string) {
  return password === ADMIN_PANEL_PASSWORD;
}

