import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from '../dto/loan/create-loan.dto';
import { UpdateLoanDto } from '../dto/loan/update-loan.dto';
import { BookItem_status, Loan_status } from '@prisma/client';

@Injectable()
export class LoanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLoanDto: CreateLoanDto) {
    const { book_item_id, reader_id, due_date, start_date } = createLoanDto;

    // Check if the book item exists and is available
    const bookItem = await this.prisma.bookItem.findUnique({
      where: { id: book_item_id },
    });

    if (!bookItem) {
      throw new NotFoundException('O exemplar do livro não foi encontrado.');
    }

    if (bookItem.status !== BookItem_status.Available) {
      throw new BadRequestException('Este exemplar não está disponível para empréstimo.');
    }

    // Use a transaction to create the loan and update the book item status
    return this.prisma.$transaction(async (prisma) => {
      const loan = await prisma.loan.create({
        data: {
          book_item_id,
          reader_id,
          due_date: new Date(due_date),
          start_date: new Date(start_date),
          status: Loan_status.Loaned,
        },
      });

      await prisma.bookItem.update({
        where: { id: book_item_id },
        data: { status: BookItem_status.Loaned },
      });

      return loan;
    });
  }

  async findAll() {
    return this.prisma.loan.findMany({
      include: {
        Reader: { include: { User: true } },
        BookItem: { include: { Book: true } },
      },
      orderBy: {
        start_date: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        Reader: { include: { User: true } },
        BookItem: { include: { Book: true } },
      },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async update(id: number, updateLoanDto: UpdateLoanDto) {
    // This is for registering a return
    if (updateLoanDto.status === 'Returned') {
      const loanToReturn = await this.prisma.loan.findUnique({ where: { id } });
      if (!loanToReturn) throw new NotFoundException('Empréstimo não encontrado.');

      return this.prisma.$transaction(async (prisma) => {
        const updatedLoan = await prisma.loan.update({
          where: { id },
          data: {
            status: Loan_status.Returned,
            return_date: updateLoanDto.return_date ? new Date(updateLoanDto.return_date) : new Date(),
          },
        });

        await prisma.bookItem.update({
          where: { id: loanToReturn.book_item_id },
          data: { status: BookItem_status.Available },
        });

        return updatedLoan;
      });
    }

    // For other generic updates
    const updateData: any = { ...updateLoanDto };
    
    // Convert date strings to Date objects if provided
    if (updateData.due_date) {
      updateData.due_date = new Date(updateData.due_date);
    }
    if (updateData.return_date) {
      updateData.return_date = new Date(updateData.return_date);
    }
    
    return this.prisma.loan.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const loan = await this.findOne(id);
    // If the loan is active, we must also make the book available again
    if (loan.status === Loan_status.Loaned) {
      await this.prisma.bookItem.update({
        where: { id: loan.book_item_id },
        data: { status: BookItem_status.Available },
      });
    }
    return this.prisma.loan.delete({ where: { id } });
  }
} 