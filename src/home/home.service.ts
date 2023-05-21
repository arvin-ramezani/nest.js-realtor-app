import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserTokenInfo } from 'src/user/decorators/user.decorator';
import {
  CreateHomeResponseDto,
  HomeResponseDto,
  UpdateHomeResponseDto,
} from './dtos/home.dto.';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

export interface CreateHomeParam {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

export interface UpdateHomeParam {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,

        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },

      where: filter,
    });

    // if (!homes.length) {
    //   throw new NotFoundException('No homes are found');
    // }

    return homes.map((home) => {
      // Just Send One Single Image
      const fetchHome = { ...home, image: home?.images[0]?.url };
      delete fetchHome.images;

      const transformedHomes = new HomeResponseDto(fetchHome);

      return transformedHomes;
    });
  }

  async getOneHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!home) throw new NotFoundException('Home not found');

    const transformedHome = new HomeResponseDto(home);
    return transformedHome;
  }

  async createHome(
    {
      address,
      numberOfBathrooms,
      city,
      numberOfBedrooms,
      landSize,
      propertyType,
      price,
      images,
    }: CreateHomeParam,
    userId: number
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        price,
        propertyType,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((img) => ({ ...img, home_id: home.id }));

    await this.prismaService.image.createMany({ data: homeImages });
    return new CreateHomeResponseDto(home);
  }

  async updateHome(
    id: number,
    {
      numberOfBathrooms,
      numberOfBedrooms,
      city,
      address,
      price,
      landSize,
      propertyType,
    }: UpdateHomeParam,
    userId: number
  ): Promise<UpdateHomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!home) {
      throw new NotFoundException();
    }

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        price,
        propertyType,
        realtor_id: userId,
      },
    });

    return new UpdateHomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });

    await this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) throw new NotFoundException();

    return home.realtor;
  }

  async inquire(buyer: UserTokenInfo, homeId: number, message: string) {
    const home = await this.getOneHomeById(homeId);

    return this.prismaService.message.create({
      data: {
        buyer_id: buyer.id,
        home_id: homeId,
        realtor_id: home.realtor_id,
        message,
      },
    });
  }

  getMessagesByHomeId(homeId: number) {
    return this.prismaService.message.findMany({
      where: {
        home_id: homeId,
      },
    });
  }
}
