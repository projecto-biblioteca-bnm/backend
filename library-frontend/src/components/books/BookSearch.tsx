import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaSearch, FaFilter, FaEye, FaSort, FaSortUp, FaSortDown, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    publication_year: number;
    description: string;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
    Category?: {
        name: string;
    };
    Publisher?: {
        name: string;
    };
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

export default function BookSearch() {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchPublishers();
        loadSearchHistory();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/book');
            setBooks(res.data);
        } catch (err) {
            setError('Falha ao carregar os livros.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/category');
            setCategories(res.data);
        } catch (err) {
            console.error('Falha ao carregar categorias:', err);
        }
    };

    const fetchPublishers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/publisher');
            setPublishers(res.data);
        } catch (err) {
            console.error('Falha ao carregar editoras:', err);
        }
    };

    const loadSearchHistory = () => {
        const history = localStorage.getItem('bookSearchHistory');
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    };

    const saveSearchHistory = (term: string) => {
        if (!term.trim()) return;
        
        const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('bookSearchHistory', JSON.stringify(newHistory));
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        saveSearchHistory(term);
        setShowHistory(false);
    };

    // Advanced filtering with null checks
    const filteredBooks = books.filter(book => {
        const searchLower = searchTerm.toLowerCase();
        const title = book.title || '';
        const author = book.author || '';
        const isbn = book.isbn || '';
        const description = book.description || '';
        
        const matchesSearch = title.toLowerCase().includes(searchLower) ||
                            author.toLowerCase().includes(searchLower) ||
                            isbn.includes(searchTerm) ||
                            description.toLowerCase().includes(searchLower);
        
        const matchesCategory = !selectedCategory || book.Category?.name === selectedCategory;
        const matchesPublisher = !selectedPublisher || book.Publisher?.name === selectedPublisher;
        
        const matchesYear = !selectedYear || book.publication_year?.toString() === selectedYear;
        
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
        
        return matchesSearch && matchesCategory && matchesPublisher && matchesStatus && matchesYear;
    });

    // Sorting logic
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        let aValue: any, bValue: any;
        
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
            case 'recent':
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
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
        setSelectedYear('');
    };

    const getBookStatus = (book: Book) => {
        const totalCopies = book.BookItem?.length || 0;
        const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
        
        if (totalCopies === 0) return { status: 'Sem exemplares', color: 'bg-gray-100 text-gray-800' };
        if (availableCopies === 0) return { status: 'Indisponível', color: 'bg-red-100 text-red-800' };
        if (availableCopies < totalCopies) return { status: 'Parcialmente disponível', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'Disponível', color: 'bg-green-100 text-green-800' };
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return <FaSort className="text-gray-400" />;
        return sortOrder === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
    };

    // Get unique years from books
    const availableYears = [...new Set(books.map(book => book.publication_year).filter(Boolean))].sort((a, b) => b - a);

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Pesquisar Obra</h1>
                <p className="text-gray-600">
                    Utilize os filtros avançados para encontrar obras específicas no acervo da biblioteca.
                </p>
            </div>

            {/* Main Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por título, autor, ISBN ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowHistory(true)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {searchHistory.map((term, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearch(term)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                            >
                                <FaSearch className="text-gray-400 text-sm" />
                                {term}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                        <FaFilter />
                        Filtros Avançados
                        {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                    </button>

                    {(searchTerm || selectedCategory || selectedPublisher || selectedStatus || selectedYear) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800"
                        >
                            <FaTimes />
                            Limpar Filtros
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Publicação</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Todos os anos</option>
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
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
                                <option value="recent-desc">Mais recentes</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                    Encontrados {sortedBooks.length} de {books.length} livros
                </p>
                {sortedBooks.length > 0 && (
                    <div className="text-sm text-gray-500">
                        {filteredBooks.length} resultados filtrados
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="text-gray-500">Carregando livros...</div>
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
                            <p className="text-gray-500">Nenhum livro encontrado com os critérios de pesquisa.</p>
                            {searchTerm && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Tente ajustar os filtros ou usar termos de pesquisa diferentes.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sortedBooks.map((book) => {
                                const bookStatus = getBookStatus(book);
                                const totalCopies = book.BookItem?.length || 0;
                                const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
                                
                                return (
                                    <div key={book.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <FaBook className="text-blue-500 text-2xl flex-shrink-0" />
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${bookStatus.color}`}>
                                                    {bookStatus.status}
                                                </span>
                                            </div>
                                            
                                            <h3 className="font-medium text-lg mb-1 line-clamp-2">{book.title || 'Sem título'}</h3>
                                            <p className="text-gray-600 text-sm mb-2">{book.author || 'Autor desconhecido'}</p>
                                            
                                            <div className="space-y-1 text-xs text-gray-500">
                                                {book.isbn && <p>ISBN: {book.isbn}</p>}
                                                {book.publication_year && <p>Ano: {book.publication_year}</p>}
                                                {book.Category && <p>Categoria: {book.Category.name}</p>}
                                                {book.Publisher && <p>Editora: {book.Publisher.name}</p>}
                                                <p>Exemplares: {availableCopies}/{totalCopies} disponíveis</p>
                                            </div>
                                            
                                            {book.description && (
                                                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                                    {book.description.substring(0, 80)}...
                                                </p>
                                            )}
                                            
                                            <div className="mt-4">
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
                            <h2 className="text-xl font-bold">Detalhes da Obra</h2>
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
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Data de Registo</label>
                                    <p>{new Date(selectedBook.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                                    <p>{new Date(selectedBook.updated_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 