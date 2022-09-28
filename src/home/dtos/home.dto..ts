import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  @ApiProperty({
    description: 'Id of home',
    example: '3',
    type: 'integer',
  })
  id: number;

  @ApiProperty({
    description: 'Address of home',
    example: '317, 2211 29 Street SW',
  })
  address: string;

  @ApiProperty({
    description: 'Image of home',
    example:
      'https://cdn.realtor.ca/listing/TS637990262830500000/reb9/highres/0/A1258300_3.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 2,
    type: 'integer',
  })
  @Exclude()
  number_of_bedrooms: number;
  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 3,
    type: 'integer',
  })
  @Exclude()
  number_of_bathrooms: number;
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  @ApiProperty({
    example: 'Los Anglos',
  })
  city: string;

  @ApiProperty({
    description: 'When home created',
    example: '2022-03-04T07:25:36.003Z',
    type: 'Date',
  })
  listed_date: Date;

  @ApiProperty({
    description: 'Price of home',
    example: 360000,
    type: 'integer',
  })
  price: number;

  @ApiProperty({
    description: 'Land size of home',
    example: 6422,
    type: 'number',
  })
  @Exclude()
  @Expose({ name: 'lasnSize' })
  landSize() {
    return this.land_size;
  }
  land_size: number;

  @ApiProperty({
    description: 'Type of home',
    enum: PropertyType,
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class Image {
  @ApiProperty({
    description: 'Url of image',
    example:
      'password@123https://cdn.realtor.ca/listing/TS637990262830500000/reb9/highres/0/A1258300_3.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeResponseDto {
  @ApiProperty({
    description: 'Address of home',
    example: '317, 2211 29 Street SW',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 2,
    type: 'integer',
  })
  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 3,
    type: 'integer',
  })
  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @ApiProperty({
    example: 'Los Anglos',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Price of home',
    example: 360000,
    type: 'integer',
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Land size of home',
    example: 6422,
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  landSize: number;

  @ApiProperty({
    description: 'Type of home',
    enum: PropertyType,
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({
    description: 'Array of images URLs',
    example: [
      {
        url: 'https://cdn.realtor.ca/listing/TS637990644654170000/reb3/highres/2/914772_10.jpg',
      },
      {
        url: 'https://cdn.realtor.ca/listing/TS637990644623500000/reb3/highres/2/914772_5.jpg',
      },
      {
        url: 'https://cdn.realtor.ca/listing/TS637990644655930000/reb3/highres/2/914772_3.jpg',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];

  constructor(partial: Partial<CreateHomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UpdateHomeResponseDto {
  @ApiProperty({
    description: 'New address of home',
    example: '317, 2211 29 Street SW',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 4,
    type: 'integer',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms?: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 5,
    type: 'integer',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms?: number;

  @ApiProperty({
    example: 'Babolsar',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'New Price',
    example: 1850000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Land size of home',
    example: 16422,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize?: number;

  @ApiProperty({
    description: 'Update type of home',
    enum: PropertyType,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({
    description: 'Array of images URLs',
    example: [
      'https://cdn.realtor.ca/listing/TS637990590487500000/reb5/highres/6/17979956_11.jpg',
      'https://cdn.realtor.ca/listing/TS637990590487470000/reb5/highres/6/17979956_10.jpg',
      'https://cdn.realtor.ca/listing/TS637990590488200000/reb5/highres/6/17979956_9.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images?: Image[];

  constructor(partial: Partial<UpdateHomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class InquireDto {
  @ApiProperty({
    description: 'Inquire message for home.',
    example: 'I like this home. How I can see it ?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
