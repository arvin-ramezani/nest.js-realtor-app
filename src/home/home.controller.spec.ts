import { PropertyType, UserType } from '@prisma/client';
import { HomeService } from './home.service';
import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 53,
  name: 'arvin',
  email: 'arvin@arvin.arvin',
  phone: '555 555 5555',
};

const mockHome = {
  id: 1,
  address: '1234 william Str',
  city: 'Toronto',
  property_type: PropertyType.RESIDENTIAL,
  image: 'img1',
  number_of_bedrooms: 3,
  number_of_bathrooms: 2.5,
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHome: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);

      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', '1500000');

      expect(mockGetHomes).toBeCalledWith({
        city: 'Toronto',
        price: {
          gte: 1500000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserTokenInfo = {
      name: 'arvin',
      id: 30,
      userType: UserType.REALTOR,
      iat: 1,
      exp: 2,
    };

    const mockUpdateHomeParams = {
      address: '111 Yellow Str',
      city: 'Vancover',
      numberOfBathrooms: 2,
      numberOfBedrooms: 2,
      landSize: 4444,
      propertyType: PropertyType.RESIDENTIAL,
      price: 30000000,
    };

    it("should throw unauth error if realtor didn't create home", async () => {
      await expect(
        controller.updateHome(5, mockUpdateHomeParams, mockUserTokenInfo)
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);

      jest.spyOn(homeService, 'updateHome').mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockUpdateHomeParams, {
        ...mockUserTokenInfo,
        id: 53,
      });

      expect(mockUpdateHome).toBeCalled();
    });
  });
});
