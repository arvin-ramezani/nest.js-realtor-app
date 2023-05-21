import { UserTokenInfo } from './../decorators/user.decorator';
import {
  Req,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { generateProductKeyDto, signinDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../decorators/user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary:
      'Signup as BUYER or REALTOR.',
    description: `For signing up as REALTOR productkey property is required which you should get it from '/auth/key' first.
     or singup as BUYER to inquire homes with sending message to 'api/home/{id}/inquire .' `,
  })
  @ApiCreatedResponse({
    description: 'User successfully registered.',
    status: 201,
  })
  @ApiConflictResponse({
    description: 'If user already exists.',
  })
  @ApiUnauthorizedResponse({
    description: `If Realtor user doesn't provide Product Key.`,
  })
  @ApiParam({ name: 'userType', enum: UserType, example: UserType.BUYER })
  @Post('signup/:userType')
  async signup(@Body() body: SignupDto, @Param('userType') userType: UserType) {
    if (!userType)
      throw new BadRequestException('Please provide userType param.');
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = `${body.email}-${userType}-${process.env.GENERATE_PRODUCT_SECRET_KEY}`;

      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey
      );

      if (!isValidProductKey) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signup({ ...body, userType });
  }

  @ApiResponse({
    description: 'Sign in user.',
    status: 201,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'Password Incorrect.',
  })
  @Post('signin')
  signin(@Body() body: signinDto) {
    return this.authService.signin(body);
  }

  @ApiOperation({
    summary:
      'In production only current ADMIN can run this endpoint for generate product key and validate user as REALTOR or ADMIN',

    description: `You need for signup as REALTOR.`,
  })
  @ApiCreatedResponse({
    description: 'User Validated successfully.',
    status: 201,
  })
  @Post('key')
  generateProductKey(@Body() { email, userType }: generateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }

  @ApiResponse({
    description: 'User Info',
    status: 200,
    type: UserTokenInfo,
  })
  @ApiBadRequestResponse({
    description: 'Please sign in first!',
  })
  @ApiUnauthorizedResponse({
    description: 'Please signup first.',
  })
  @ApiBearerAuth('access-token')
  @Get('me')
  @Roles(UserType.ADMIN, UserType.REALTOR, UserType.BUYER)
  async me(@Req() req: Request, @User() user: UserTokenInfo) {
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
