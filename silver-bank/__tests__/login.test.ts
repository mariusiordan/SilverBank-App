import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Mock Prisma - simulăm DB
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';
import { POST } from '@/app/api/auth/login/route';

describe('POST /api/auth/login', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login reușit cu credențiale corecte', async () => {
    // Simulăm un user în DB cu parola criptată
    const hashedPassword = await bcrypt.hash('parola123', 10);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: hashedPassword,
    });

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'parola123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verificăm că s-a setat cookie-ul cu token
    const cookie = res.headers.get('set-cookie');
    expect(cookie).toContain('token=');
  });

  it('respinge parola greșită', async () => {
    const hashedPassword = await bcrypt.hash('parola123', 10);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: hashedPassword,
    });

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'parola-gresita' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401); // 401 = Unauthorized
  });

  it('respinge user inexistent', async () => {
    // Simulăm că userul nu există în DB
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nimeni@test.com', password: 'parola123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404); // 404 = Not Found
  });

});
expect(true).toBe(false)  // ← adaugă această linie undeva