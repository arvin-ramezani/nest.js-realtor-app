import { PropertyType } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 1,
    address: '1234 william Str',
    city: 'Toronto',
    property_type: PropertyType.RESIDENTIAL,
    image: 'img1',
    number_of_bedrooms: 3,
    number_of_bathrooms: 2.5,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

const mockHome = {
  id: 1,
  address: '1234 william Str',
  city: 'Toronto',
  property_type: PropertyType.RESIDENTIAL,
  image: 'img1',
  number_of_bedrooms: 3,
  number_of_bathrooms: 2.5,
};

const mockImage = [
  {
    id: 1,
    url: 'src1',
  },
  {
    id: 2,
    url: 'src2',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImage),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
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

        where: filters,
      });
    });

    it('should return not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });

    describe('createHome', () => {
      const mockCreateHomeParams = {
        address: '111 Yellow Str',
        city: 'Vancover',
        numberOfBathrooms: 2,
        numberOfBedrooms: 2,
        landSize: 4444,
        propertyType: PropertyType.RESIDENTIAL,
        price: 30000000,
        images: [{ url: 'src1' }],
      };

      it('should call prisma home.create with correct payload', async () => {
        const mockCreateHome = jest.fn().mockReturnValue(mockHome);

        jest
          .spyOn(prismaService.home, 'create')
          .mockImplementation(mockCreateHome);

        await service.createHome(mockCreateHomeParams, 5);

        expect(mockCreateHome).toBeCalledWith({
          data: {
            address: '111 Yellow Str',
            city: 'Vancover',
            number_of_bedrooms: 2,
            number_of_bathrooms: 2,
            land_size: 4444,
            propertyType: PropertyType.RESIDENTIAL,
            price: 30000000,
            realtor_id: 5,
          },
        });
      });

      it('should call image.createMany with the correct payload', async () => {
        const mockCreateManyImage = jest.fn().mockReturnValue(mockImage);

        jest
          .spyOn(prismaService.image, 'createMany')
          .mockImplementation(mockCreateManyImage);

        await service.createHome(mockCreateHomeParams, 5);

        expect(mockCreateManyImage).toBeCalledWith({
          data: [
            {
              url: 'src1',
              home_id: 1,
            },
          ],
        });
      });
    });
  });
});
