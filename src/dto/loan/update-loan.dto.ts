import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Loan_status } from '@prisma/client';

export class UpdateLoanDto {
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsDateString()
  return_date?: string;

  @IsOptional()
  @IsEnum(Loan_status)
  status?: Loan_status;
} 