// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // ---------- Legacy OTP endpoints (kept so nothing breaks) ----------
  @Post('send-otp')
  send(@Body() body: { phone: string }) {
    return this.auth.requestOtp(body.phone);
  }

  @Post('verify-otp')
  verify(@Body() body: { phone: string; code: string }) {
    return this.auth.verifyOtp(body.phone, body.code);
  }

  // ---------- Email / Password auth ----------
  @Post('register')
  register(
    @Body()
    body: {
      email: string;
      password: string;
      name?: string;
      phone?: string;
    },
  ) {
    // returns { token, user: { id, email, name, phone } }
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    // returns { token, user: { id, email, name, phone } }
    return this.auth.login(body.email, body.password);
  }

  // ---------- Authenticated user ----------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    // req.user is populated by JwtStrategy.validate()
    return req.user; // e.g. { userId, email }
  }
}
