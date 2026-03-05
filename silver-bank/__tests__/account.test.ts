import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signToken } from '@/lib/jwt';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';
import { GET } from '@/app/api/account/route';

describe('GET /api/account', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returnează datele contului pentru user autentificat', async () => {
    // Simulăm un user cu cont în DB
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      accounts: [{
        id: 1,
        iban: 'GB1234567890',
        balance: 1000,
        transactions: [],
      }],
    });

    // Creăm un token valid ca și cum userul e logat
    const token = signToken({ userId: 1 });

    const req = new Request('http://localhost:3000/api/account', {
      headers: {
        cookie: `token=${token}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.email).toBe('test@test.com');
    expect(data.account.iban).toBe('GB1234567890');
  });

  it('respinge request fără token', async () => {
    const req = new Request('http://localhost:3000/api/account');

    const res = await GET(req);
    expect(res.status).toBe(401); // 401 = Unauthorized
  });

  it('respinge token invalid', async () => {
    const req = new Request('http://localhost:3000/api/account', {
      headers: {
        cookie: 'token=token-fals-123',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

});
