import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ "Mock" pentru Prisma - simulăm baza de date fără conexiune reală
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';
import { POST } from '@/app/api/auth/register/route';

describe('POST /api/auth/register', () => {

  beforeEach(() => {
    vi.clearAllMocks();  // resetăm mock-urile între teste
  });

  it('înregistrează un user nou cu succes', async () => {
    // Simulăm că emailul NU există deja în DB
    (prisma.user.findUnique as any).mockResolvedValue(null);
    // Simulăm că userul a fost creat
    (prisma.user.create as any).mockResolvedValue({ id: 1, email: 'test@test.com', name: 'Test' });

    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'parola123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it('respinge dacă emailul există deja', async () => {
    // Simulăm că emailul EXISTĂ deja în DB
    (prisma.user.findUnique as any).mockResolvedValue({ id: 1, email: 'test@test.com' });

    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'parola123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409); // 409 = Conflict
  });

  it('respinge dacă lipsesc câmpuri obligatorii', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com' }), // lipsește parola
    });

    const res = await POST(req);
    expect(res.status).toBe(400); // 400 = Bad Request
  });

});
