import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'Name of user',
    example: 'Jhon',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Phone number',
    example: '00989123456789',
  })
  // @Matches(/^(\d{4})$/, { message: 'Please Provide A Valid Phone Number' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Email',
    example: 'JhonDoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of user',
    example: 'password@123',
  })
  @IsString()
  @MinLength(5, { message: 'Password Must Be At Least 5 Characters' })
  password: string;

  @ApiProperty({
    description:
      'Some hashed token based on user info for Authenticate REALTORs and ADMINs.',
    example: `Take it from 'api/auth/key'. `,
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  productKey?: string;
}

export class signinDto {
  @ApiProperty({
    description: 'Email',
    example: 'JhonDoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of user',
    example: 'password@123',
  })
  @IsString()
  password: string;
}

export class generateProductKeyDto {
  @ApiProperty({
    description: 'Email',
    example: 'JhonDoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: [UserType.REALTOR, UserType.ADMIN] })
  @IsEnum([UserType.ADMIN, UserType.REALTOR])
  userType: UserType;
}
