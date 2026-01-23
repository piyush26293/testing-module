import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateUser(username: string, _password: string): Promise<any> {
    // Simplified validation for MVP
    // In production, this should check against database with bcrypt
    return { userId: 1, username };
  }
}
