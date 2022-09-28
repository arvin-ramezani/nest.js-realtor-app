import * as JWT from 'jsonwebtoken';
import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

interface singupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
  userType: UserType;
}

interface signinParams {
  email: string;
  password: string;
}

interface jwtPayload {
  name: string;
  id: number;
  userType: UserType;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ email, password, name, phone, userType }: singupParams) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        user_type: userType || UserType.BUYER,
      },
    });

    const jwtPayload: jwtPayload = {
      name,
      id: user.id,
      userType: userType || UserType.BUYER,
    };
    return await this.generateJWT(jwtPayload);
  }

  async signin({ email, password }: signinParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid Credentials', 404);
    }

    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid Credentials', 400);
    }

    const jwtPayload: jwtPayload = {
      name: user.name,
      id: user.id,
      userType: user.user_type,
    };

    return await this.generateJWT(jwtPayload);
  }

  async generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.GENERATE_PRODUCT_SECRET_KEY}`;

    return bcrypt.hash(string, 10);
  }

  async generateJWT(jwtPayload: jwtPayload) {
    const { name, id, userType } = jwtPayload;
    return JWT.sign(
      {
        name,
        id,
        userType,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: 3600000000 }
    );
  }

  async validateJWTToken(token: string) {
    console.log(process.env.JWT_SECRET_KEY, token, '___');
    try {
      const jwtPayload = JWT.verify(token, process.env.JWT_SECRET_KEY);
      return jwtPayload;
    } catch (err) {
      throw new UnauthorizedException('Token is not valid.');
    }
  }
}
