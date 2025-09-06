// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';


type OtpData = { code: string; expiresAt: number; lastSentAt: number };
const otpStore = new Map<string, OtpData>();

const EXP_MIN = Number(process.env.OTP_EXP_MINUTES ?? 5);
const COOLDOWN_S = Number(process.env.OTP_COOLDOWN_SECONDS ?? 45);
const DEBUG = process.env.OTP_DEBUG === '1';

function genCode() {
  if (DEBUG) return '123456'; // easy testing
  return String(Math.floor(100000 + Math.random() * 900000));
}

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  // --------------------------------------------------------------------
  // OTP (kept for backward-compat with your current flow)
  // --------------------------------------------------------------------
  async requestOtp(phone: string) {
    phone = (phone || '').trim();
    if (!/^\d{10}$/.test(phone)) throw new BadRequestException('Invalid phone');

    const now = Date.now();
    const prev = otpStore.get(phone);
    if (prev && now - prev.lastSentAt < COOLDOWN_S * 1000) {
      const wait = Math.ceil(
        (COOLDOWN_S * 1000 - (now - prev.lastSentAt)) / 1000,
      );
      return { ok: true, wait }; // front-end can show "wait Xs"
    }

    const code = genCode();
    otpStore.set(phone, {
      code,
      lastSentAt: now,
      expiresAt: now + EXP_MIN * 60_000,
    });

    // TODO: integrate SMS provider here
    console.log(`[OTP] ${phone} -> ${code}`);
    return { ok: true };
  }

  async verifyOtp(phone: string, code: string) {
    phone = (phone || '').trim();
    code = (code || '').trim();

    const rec = otpStore.get(phone);
    if (!rec) throw new BadRequestException('OTP not requested');
    if (Date.now() > rec.expiresAt) {
      otpStore.delete(phone);
      throw new BadRequestException('OTP expired');
    }
    if (rec.code !== code) throw new BadRequestException('Invalid code');

    // Create/find user by phone
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
      select: { id: true, phone: true, email: true, name: true },
    });

    const token = await this.issueToken(user);
    otpStore.delete(phone); // optional: clear after use
    return { token, user };
  }

  // --------------------------------------------------------------------
  // Email/Password auth
  // --------------------------------------------------------------------
  private normalizeEmail(email: string) {
    return (email || '').trim().toLowerCase();
  }

  private async issueToken(user: {
    id: string;
    email?: string | null;
    phone?: string | null;
  }) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    });
  }

  async register(input: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) {
    const email = this.normalizeEmail(input.email);
    const name = (input.name ?? '').trim() || null;
    const phone = (input.phone ?? '').trim() || null;
    const password = input.password ?? '';

    if (!/^\S+@\S+\.\S+$/.test(email))
      throw new BadRequestException('Invalid email');
    if (password.length < 6)
      throw new BadRequestException('Password must be at least 6 characters');

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);

    if (!phone) {
  throw new BadRequestException('Phone is required');
}

const user = await this.prisma.user.create({
  data: {
    email,
    passwordHash,
    name,
    phone, // safe now
  },
});

    const token = await this.issueToken(user);
    return { token, user };
  }

  async login(email: string, password: string) {
    email = this.normalizeEmail(email);

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        passwordHash: true,
      },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.issueToken(user);
    const { passwordHash, ...publicUser } = user;
    return { token, user: publicUser };
  }
}
