import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { LoginUserDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/user/login-user.dto';
import { CreateUserDto } from '../dto/user/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginUserDto) {
    const user = await this.userService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    console.log('User in login:', user);
    const payload = {
      userId: user.id,
      sub: user.id,
      username: user.username,
      email: user.email,
      userType: user.user_type,
    };
    return {
      access_token: this.jwtService.sign(payload),
      userType: user.user_type,
      user: result,
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      // Optionally, remove password from response
      const { password, ...result } = user;
      return result;
    } catch (error: any) {
      if (
        error.code === 'P2002' &&
        error.meta &&
        error.meta.target &&
        error.meta.target.includes('email')
      ) {
        throw new BadRequestException('Email já está em uso');
      }
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal that the user does not exist
      console.log(`Password reset attempt for non-existent email: ${forgotPasswordDto.email}`);
      return { message: 'Se um usuário com este email existir, um link de redefinição de senha será enviado.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Token valid for 1 hour

    await this.userService.updateUser(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expirationDate,
    });
    
    // --- SIMULATE SENDING EMAIL ---
    // In a real app, you would use a mailer service to send this link
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}`;
    console.log('------------------------------------');
    console.log(`Password Reset Link: ${resetUrl}`);
    console.log('------------------------------------');
    // --- END SIMULATION ---

    return { message: 'Link de redefinição de senha enviado.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(resetPasswordDto.token).digest('hex');

    const user = await this.userService.findUserByResetToken(hashedToken);

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token de redefinição de senha é inválido ou expirou.');
    }
    
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    
    await this.userService.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Senha redefinida com sucesso.' };
  }
}
