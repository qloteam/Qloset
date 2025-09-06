import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!, // <- must be defined
    });
  }

  // Adjust payload shape if your AuthService signs different claims
  async validate(payload: { sub: string; email?: string }) {
    // Example: attach user to request
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    return user || null;
  }
}
