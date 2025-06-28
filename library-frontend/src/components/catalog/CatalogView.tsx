import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { FaBook, FaSearch, FaFilter } from 'react-icons/fa';

interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    publication_year: number;
    description: string;
    Category?: { name: string };
    Publisher?: { name: string };
    BookItem?: Array<{
        id: number;
        status: string;
        location: string;
    }>;
}

interface Category {
    id: number;
    name: string;
}

interface Publisher {
    id: number;
    name: string;
}

export default function CatalogView() {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchPublishers();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/book');
            setBooks(res.data);
        } catch {
            setError('Falha ao carregar o catálogo.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/category');
            setCategories(res.data);
        } catch (err) {
            console.error('Falha ao carregar categorias:', err);
        }
    };

    const fetchPublishers = async () => {
        try {
            const res = await api.get('/publisher');
            setPublishers(res.data);
        } catch (err) {
            console.error('Falha ao carregar editoras:', err);
        }
    };

    // Fixed filter logic with null checks
    const filteredBooks = books.filter(book => {
        const searchLower = searchTerm.toLowerCase();
        const title = book.title || '';
        const author = book.author || '';
        const isbn = book.isbn || '';
        
        const matchesSearch = title.toLowerCase().includes(searchLower) ||
                            author.toLowerCase().includes(searchLower) ||
                            isbn.includes(searchTerm);
        
        const matchesCategory = !selectedCategory || book.Category?.name === selectedCategory;
        const matchesPublisher = !selectedPublisher || book.Publisher?.name === selectedPublisher;
        
        let matchesStatus = true;
        if (selectedStatus) {
            const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
            const totalCopies = book.BookItem?.length || 0;
            
            switch (selectedStatus) {
                case 'available':
                    matchesStatus = availableCopies > 0;
                    break;
                case 'unavailable':
                    matchesStatus = availableCopies === 0 && totalCopies > 0;
                    break;
                case 'no_copies':
                    matchesStatus = totalCopies === 0;
                    break;
            }
        }
        
        return matchesSearch && matchesCategory && matchesPublisher && matchesStatus;
    });

    // Sorting logic
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        let aValue: string | number, bValue: string | number;
        
        switch (sortBy) {
            case 'title':
                aValue = (a.title || '').toLowerCase();
                bValue = (b.title || '').toLowerCase();
                break;
            case 'author':
                aValue = (a.author || '').toLowerCase();
                bValue = (b.author || '').toLowerCase();
                break;
            case 'year':
                aValue = a.publication_year || 0;
                bValue = b.publication_year || 0;
                break;
            case 'copies':
                aValue = a.BookItem?.length || 0;
                bValue = b.BookItem?.length || 0;
                break;
            case 'available':
                aValue = a.BookItem?.filter(item => item.status === 'Available').length || 0;
                bValue = b.BookItem?.filter(item => item.status === 'Available').length || 0;
                break;
            default:
                aValue = (a.title || '').toLowerCase();
                bValue = (b.title || '').toLowerCase();
        }
        
        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedPublisher('');
        setSelectedStatus('');
    };

    const getBookStatus = (book: Book) => {
        const totalCopies = book.BookItem?.length || 0;
        const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
        
        if (totalCopies === 0) return { status: 'Sem exemplares', color: 'bg-gray-100 text-gray-800' };
        if (availableCopies === 0) return { status: 'Indisponível', color: 'bg-red-100 text-red-800' };
        if (availableCopies < totalCopies) return { status: 'Parcialmente disponível', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'Disponível', color: 'bg-green-100 text-green-800' };
    };

    const getAvailabilityIndicators = (availableCopies: number) => {
        if (availableCopies === 0) return null;
        
        // Show up to 5 indicators, or show the number if more than 5
        const maxIndicators = 5;
        const indicators = [];
        
        if (availableCopies <= maxIndicators) {
            for (let i = 0; i < availableCopies; i++) {
                indicators.push(
                    <span key={i} className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                );
            }
        } else {
            // Show 5 indicators plus the count
            for (let i = 0; i < maxIndicators; i++) {
                indicators.push(
                    <span key={i} className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                );
            }
            indicators.push(
                <span key="count" className="text-xs text-green-600 font-medium ml-1">
                    +{availableCopies - maxIndicators}
                </span>
            );
        }
        
        return indicators;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Catálogo Digital da Biblioteca</h1>
                <p className="text-gray-600">
                    Explore o nosso catálogo completo de obras com {books.length} títulos disponíveis.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar por título, autor ou ISBN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        <FaFilter />
                        Filtros Avançados
                    </button>

                    {/* Clear Filters */}
                    {(searchTerm || selectedCategory || selectedPublisher || selectedStatus) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-red-600 hover:text-red-800"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="">Todas as categorias</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Editora</label>
                                <select
                                    value={selectedPublisher}
                                    onChange={(e) => setSelectedPublisher(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="">Todas as editoras</option>
                                    {publishers.map((publisher) => (
                                        <option key={publisher.id} value={publisher.name}>
                                            {publisher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="">Todos os estados</option>
                                    <option value="available">Disponível</option>
                                    <option value="unavailable">Indisponível</option>
                                    <option value="no_copies">Sem exemplares</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        setSortBy(field);
                                        setSortOrder(order as 'asc' | 'desc');
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="title-asc">Título (A-Z)</option>
                                    <option value="title-desc">Título (Z-A)</option>
                                    <option value="author-asc">Autor (A-Z)</option>
                                    <option value="author-desc">Autor (Z-A)</option>
                                    <option value="year-desc">Ano (mais recente)</option>
                                    <option value="year-asc">Ano (mais antigo)</option>
                                    <option value="available-desc">Mais disponíveis</option>
                                    <option value="copies-desc">Mais exemplares</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                    Mostrando {sortedBooks.length} de {books.length} resultados
                </p>
                {sortedBooks.length > 0 && (
                    <div className="text-sm text-gray-500">
                        {filteredBooks.length} livros encontrados
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="text-gray-500">Carregando catálogo...</div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <div className="text-red-500">{error}</div>
                </div>
            )}

            {/* Books Grid */}
            {!loading && !error && (
                <>
                    {sortedBooks.length === 0 ? (
                        <div className="text-center py-12">
                            <FaBook className="mx-auto text-gray-400 text-4xl mb-4" />
                            <p className="text-gray-500">Nenhum livro encontrado com os filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sortedBooks.map((book) => {
                                const bookStatus = getBookStatus(book);
                                const totalCopies = book.BookItem?.length || 0;
                                const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
                                const availabilityIndicators = getAvailabilityIndicators(availableCopies);
                                
                                return (
                                    <div key={book.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <FaBook className="text-blue-500 text-2xl flex-shrink-0" />
                                                <div className="flex flex-col items-end">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bookStatus.color} mb-1`}>
                                                        {bookStatus.status}
                                                    </span>
                                                    {availabilityIndicators && (
                                                        <div className="flex items-center">
                                                            {availabilityIndicators}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <h3 className="font-medium text-lg mb-1 truncate">{book.title || 'Sem título'}</h3>
                                            <p className="text-gray-600 text-sm mb-2 truncate">{book.author || 'Autor desconhecido'}</p>
                                            
                                            <div className="space-y-1 text-xs text-gray-500">
                                                {book.isbn && <p>ISBN: {book.isbn}</p>}
                                                {book.publication_year && <p>Ano: {book.publication_year}</p>}
                                                {book.Category && <p>Categoria: {book.Category.name}</p>}
                                                {book.Publisher && <p>Editora: {book.Publisher.name}</p>}
                                            </div>
                                            
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="text-xs text-gray-500">
                                                    {totalCopies > 0 ? (
                                                        <span>
                                                            {availableCopies} de {totalCopies} exemplares
                                                        </span>
                                                    ) : (
                                                        <span>Sem exemplares</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedBook(book)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Ver detalhes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Book Details Modal */}
            {selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Detalhes do Livro</h2>
                            <button
                                onClick={() => setSelectedBook(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{selectedBook.title || 'Sem título'}</h3>
                                <p className="text-gray-600">{selectedBook.author || 'Autor desconhecido'}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {selectedBook.isbn && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ISBN</label>
                                        <p className="text-gray-900">{selectedBook.isbn}</p>
                                    </div>
                                )}
                                {selectedBook.publication_year && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ano de Publicação</label>
                                        <p className="text-gray-900">{selectedBook.publication_year}</p>
                                    </div>
                                )}
                                {selectedBook.Category && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                                        <p className="text-gray-900">{selectedBook.Category.name}</p>
                                    </div>
                                )}
                                {selectedBook.Publisher && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Editora</label>
                                        <p className="text-gray-900">{selectedBook.Publisher.name}</p>
                                    </div>
                                )}
                            </div>
                            
                            {selectedBook.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                    <p className="text-gray-900">{selectedBook.description}</p>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exemplares</label>
                                <div className="mt-2 space-y-2">
                                    {selectedBook.BookItem && selectedBook.BookItem.length > 0 ? (
                                        selectedBook.BookItem.map((item, index) => (
                                            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-sm">
                                                    Exemplar {index + 1} - {item.location}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    item.status === 'Available' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status === 'Available' ? 'Disponível' : 'Indisponível'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Nenhum exemplar registado</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 