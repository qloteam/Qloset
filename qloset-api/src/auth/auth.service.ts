import { Injectable } from '@nestjs/common';

const otpStore = new Map<string, string>();

@Injectable()
export class AuthService {
  async requestOtp(phone: string) {
    const code = '123456'; // TODO: generate and send via SMS provider
    otpStore.set(phone, code);
    return { ok: true };
  }
  async verifyOtp(phone: string, code: string) {
    const ok = otpStore.get(phone) === code;
    return ok ? { token: 'fake-jwt', user: { phone } } : { error: 'Invalid code' };
  }
}
