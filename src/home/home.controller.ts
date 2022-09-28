import { AuthService } from './../user/auth/auth.service';
import { UserTokenInfo } from './../user/decorators/user.decorator';
import {
  CreateHomeResponseDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeResponseDto,
} from './dtos/home.dto.';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { PropertyType, UserType } from '@prisma/client';
import { User } from 'src/user/decorators/user.decorator';
import { Roles } from '../decorators/roles.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('homes')
@Controller('api/homes')
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly authService: AuthService
  ) {}

  @ApiOperation({
    summary: 'Get all homes and filter by query params.',
    description: 'You can provide multiple query params to filter or nothing.',
  })
  @ApiResponse({
    description: 'Get all homes.',
    status: 200,
  })
  @ApiNotFoundResponse({
    description: 'Home not found.',
  })
  @ApiQuery({ name: 'city', example: 'Los Anglos', required: false })
  @ApiQuery({ name: 'minPrice', example: '320000', required: false })
  @ApiQuery({ name: 'maxPrice', example: '420000', required: false })
  @ApiQuery({ name: 'propertyType', enum: PropertyType, required: false })
  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),

      ...(propertyType && { propertyType }),
    };

    return this.homeService.getHomes(filters);
  }

  @ApiOperation({
    summary: 'Get home by id.',
  })
  @ApiResponse({
    description: 'Success.',
    status: 200,
  })
  @ApiNotFoundResponse({
    description: 'Home not found.',
  })
  @Get(':id')
  getOneHome(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getOneHomeById(id);
  }

  @ApiOperation({
    summary: 'Realtor can create home.',
  })
  @ApiResponse({
    description: 'Home craeted successfully.',
    status: 201,
  })
  @ApiForbiddenResponse({
    description: 'You must be realtor to create home.',
  })
  @ApiUnauthorizedResponse({
    description: 'Please signup as realtor first.',
  })
  @ApiBadRequestResponse({
    description: 'For invalid inputs.',
  })
  @ApiBearerAuth('access-token')
  @Roles(UserType.REALTOR)
  @Post()
  async createHome(
    @Req() req: Request,
    @Body() body: CreateHomeResponseDto,
    @User() user: UserTokenInfo
  ): Promise<CreateHomeResponseDto> {
    return this.homeService.createHome(body, user.id);
  }

  @ApiOperation({
    summary: 'Realtor can update own home.',
  })
  @ApiResponse({
    description: 'Home updated successfully.',
    status: 200,
  })
  @ApiForbiddenResponse({
    description:
      "Only realtor users can update home. | Realtor id and home creator id didn't match.",
  })
  @ApiUnauthorizedResponse({
    description: 'Please signup as realtor first.',
  })
  @ApiBadRequestResponse({
    description: 'For invalid inputs.',
  })
  @ApiBearerAuth('access-token')
  @Roles(UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeResponseDto,
    @User() user: UserTokenInfo
  ): Promise<UpdateHomeResponseDto> {
    return this.homeService.updateHome(id, body);
  }

  @ApiOperation({
    summary: 'Realtor can delete own home.',
  })
  @ApiResponse({
    description: 'Home deleted successfully.',
    status: 200,
  })
  @ApiForbiddenResponse({
    description:
      "Only realtor users can delete home. | Realtor id and home creator id didn't match.",
  })
  @ApiUnauthorizedResponse({
    description: 'Please signup as realtor first.',
  })
  @ApiBearerAuth('access-token')
  @Roles(UserType.REALTOR)
  @Delete(':id')
  async deleteHome(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserTokenInfo
  ) {
    return this.homeService.deleteHome(id);
  }

  @ApiOperation({
    summary: 'Buyer can inquire for a home by messaging.',
  })
  @ApiResponse({
    description: 'Inqure home successfully.',
    status: 201,
  })
  @ApiUnauthorizedResponse({
    description: 'Please signup first.',
  })
  @ApiBadRequestResponse({
    description: 'For invalid inputs.',
  })
  @ApiParam({ name: 'id', description: 'Id of the home.' })
  @ApiBearerAuth('access-token')
  @Roles(UserType.BUYER)
  @Post(':id/inquire')
  async inquire(
    @Req() req: Request,
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: UserTokenInfo,
    @Body() { message }: InquireDto
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @ApiOperation({
    summary: 'Realtor can see all messages for specific home.',
  })
  @ApiResponse({
    description: 'Get all home messages.',
    status: 200,
  })
  @ApiForbiddenResponse({
    description:
      "Only realtor users can delete home. | Realtor id and home creator id didn't match.",
  })
  @ApiUnauthorizedResponse({
    description: 'Please signup as realtor first.',
  })
  @ApiBadRequestResponse({
    description: 'For invalid inputs.',
  })
  @ApiBearerAuth('access-token')
  @Roles(UserType.REALTOR)
  @Get(':id/messages')
  async getHomeMessages(
    @Req() req: Request,
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: UserTokenInfo
  ) {
    return this.homeService.getMessagesByHomeId(homeId);
  }
}
