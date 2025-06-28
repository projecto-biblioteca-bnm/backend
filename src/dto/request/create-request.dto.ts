import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export enum RequestType {
  READER_CARD = 'ReaderCard',
  BOOK_PURCHASE = 'BookPurchase',
  FACILITY_ACCESS = 'FacilityAccess',
  SPECIAL_PERMISSION = 'SpecialPermission',
  OTHER = 'Other'
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed'
}

export class CreateRequestDto {
  @IsInt()
  reader_id: number;

  @IsEnum(RequestType)
  type: RequestType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 