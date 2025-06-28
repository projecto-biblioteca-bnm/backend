import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from '../dto/book/create-book.dto';
import { UpdateBookDto } from '../dto/book/update-book.dto';
import { Book } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper method to format author names
  private formatAuthors(bookAuthors: any[]): string {
    if (!bookAuthors || bookAuthors.length === 0) {
      return 'Autor desconhecido';
    }
    
    return bookAuthors
      .map(ba => `${ba.Author.first_name} ${ba.Author.last_name}`.trim())
      .join(', ');
  }

  // Helper method to transform book data
  private transformBookData(book: any): any {
    if (!book) return book;
    
    return {
      ...book,
      author: this.formatAuthors(book.Book_Author),
      authors: book.Book_Author?.map((ba: any) => ({
        id: ba.Author.id,
        first_name: ba.Author.first_name,
        last_name: ba.Author.last_name,
        nationality: ba.Author.nationality,
      })) || [],
    };
  }

  async create(createBookDto: CreateBookDto): Promise<any> {
    const { authors, ...bookData } = createBookDto;
    
    return this.prisma.$transaction(async (prisma) => {
      // Create the book
      const book = await prisma.book.create({
        data: bookData,
        include: {
          Category: true,
          Publisher: true,
          BookItem: true,
          Book_Author: {
            include: {
              Author: true,
            },
          },
        },
      });

      // Handle authors if provided
      if (authors && authors.length > 0) {
        for (const authorData of authors) {
          // Check if author already exists
          let author = await prisma.author.findFirst({
            where: {
              first_name: authorData.first_name,
              last_name: authorData.last_name,
            },
          });

          // Create author if doesn't exist
          if (!author) {
            author = await prisma.author.create({
              data: authorData,
            });
          }

          // Create book-author relationship
          await prisma.book_Author.create({
            data: {
              book_id: book.id,
              author_id: author.id,
            },
          });
        }

        // Fetch the book again with updated author relationships
        const updatedBook = await prisma.book.findUnique({
          where: { id: book.id },
          include: {
            Category: true,
            Publisher: true,
            BookItem: true,
            Book_Author: {
              include: {
                Author: true,
              },
            },
          },
        });
        
        return this.transformBookData(updatedBook);
      }

      return this.transformBookData(book);
    });
  }

  async findAll(): Promise<any[]> {
    const books = await this.prisma.book.findMany({
      include: {
        Category: true,
        Publisher: true,
        BookItem: true,
        Book_Author: {
          include: {
            Author: true,
          },
        },
      },
    });
    
    return books.map(book => this.transformBookData(book));
  }

  async findOne(id: number): Promise<any> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        Category: true,
        Publisher: true,
        BookItem: true,
        Book_Author: {
          include: {
            Author: true,
          },
        },
      },
    });
    
    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }
    
    return this.transformBookData(book);
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<any> {
    // Check if book exists
    await this.findOne(id);
    
    const { authors, ...bookData } = updateBookDto;
    
    return this.prisma.$transaction(async (prisma) => {
      // Update the book
      const book = await prisma.book.update({
        where: { id },
        data: bookData,
        include: {
          Category: true,
          Publisher: true,
          BookItem: true,
          Book_Author: {
            include: {
              Author: true,
            },
          },
        },
      });

      // Handle authors if provided
      if (authors) {
        // Remove existing author relationships
        await prisma.book_Author.deleteMany({
          where: { book_id: id },
        });

        // Add new author relationships
        for (const authorData of authors) {
          // Check if author already exists
          let author = await prisma.author.findFirst({
            where: {
              first_name: authorData.first_name,
              last_name: authorData.last_name,
            },
          });

          // Create author if doesn't exist
          if (!author) {
            author = await prisma.author.create({
              data: authorData,
            });
          }

          // Create book-author relationship
          await prisma.book_Author.create({
            data: {
              book_id: id,
              author_id: author.id,
            },
          });
        }

        // Fetch the book again with updated author relationships
        const updatedBook = await prisma.book.findUnique({
          where: { id },
          include: {
            Category: true,
            Publisher: true,
            BookItem: true,
            Book_Author: {
              include: {
                Author: true,
              },
            },
          },
        });
        
        return this.transformBookData(updatedBook);
      }

      return this.transformBookData(book);
    });
  }

  async remove(id: number): Promise<void> {
    // Check if book exists
    await this.findOne(id);
    
    // Get all book items for this book
    const bookItems = await this.prisma.bookItem.findMany({
      where: { book_id: id },
      include: {
        Loan: true,
        Reservation: true,
      },
    });
    
    // Delete all related loans first
    for (const bookItem of bookItems) {
      if (bookItem.Loan.length > 0) {
        await this.prisma.loan.deleteMany({
          where: { book_item_id: bookItem.id },
        });
      }
      
      // Delete all related reservations
      if (bookItem.Reservation.length > 0) {
        await this.prisma.reservation.deleteMany({
          where: { book_item_id: bookItem.id },
        });
      }
    }
    
    // Delete all related book items
    await this.prisma.bookItem.deleteMany({
      where: { book_id: id },
    });
    
    // Then delete the book
    await this.prisma.book.delete({
      where: { id },
    });
  }

  async manageCopies(id: number, action: 'add' | 'remove', count: number): Promise<any> {
    // Check if book exists
    const book = await this.findOne(id);
    
    if (action === 'add') {
      // Add new copies
      const bookItemPromises = [];
      for (let i = 0; i < count; i++) {
        const uniqueCode = `${book.isbn}-COPY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        bookItemPromises.push(
          this.prisma.bookItem.create({
            data: {
              book_id: id,
              unique_code: uniqueCode,
              status: 'Available',
            },
          })
        );
      }
      
      await Promise.all(bookItemPromises);
      return { message: `${count} cópia(s) adicionada(s) com sucesso` };
    } else if (action === 'remove') {
      // Remove copies (only available ones)
      const availableBookItems = await this.prisma.bookItem.findMany({
        where: {
          book_id: id,
          status: 'Available',
        },
      });
      
      if (availableBookItems.length < count) {
        throw new Error(`Apenas ${availableBookItems.length} cópia(s) disponível(is) para remoção`);
      }
      
      // Delete the specified number of available copies
      const itemsToDelete = availableBookItems.slice(0, count);
      await this.prisma.bookItem.deleteMany({
        where: {
          id: {
            in: itemsToDelete.map(item => item.id),
          },
        },
      });
      
      return { message: `${count} cópia(s) removida(s) com sucesso` };
    }
    
    throw new Error('Ação inválida. Use "add" ou "remove"');
  }
}
