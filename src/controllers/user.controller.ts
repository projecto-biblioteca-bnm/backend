import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { ChangePasswordDto } from '../dto/user/change-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('readers')
  findAllReaders() {
    return this.userService.findAllReaders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    console.log('req.user:', req.user);
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('ID de usuário inválido no token.');
    }
    return this.userService.findOne(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.userId;
    console.log('userId from JWT:', userId);
    if (!userId || typeof userId !== 'number' || isNaN(userId)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    return this.userService.changePassword(userId, dto);
  }

  @Post('fix-readers')
  async fixReaders() {
    return this.userService.fixMissingReaderRecords();
  }
}
