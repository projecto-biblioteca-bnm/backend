"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaEye, FaTrashAlt } from 'react-icons/fa';

interface Book {
  id: number;
  isbn: string;
  title: string;
  publication_year: number | null;
  author: string;
  authors: Array<{
    id: number;
    first_name: string;
    last_name: string;
    nationality?: string;
  }>;
  Category?: {
    id: number;
    name: string;
  };
  Publisher?: {
    id: number;
    name: string;
  };
  BookItem?: Array<{
    id: number;
    status: string;
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

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [copyAction, setCopyAction] = useState<'add' | 'remove'>('add');
  const [copyCount, setCopyCount] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    category_id: "",
    publisher_id: "",
    copies: "1", // Default to 1 copy
    authors: [] as Array<{
      first_name: string;
      last_name: string;
      nationality: string;
    }>,
  });

  const [newAuthor, setNewAuthor] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchPublishers();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/book");
      setBooks(response.data);
    } catch (err) {
      setError("Falha ao buscar livros.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/category");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/publisher");
      setPublishers(response.data);
    } catch (err) {
      console.error("Failed to fetch publishers", err);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAuthorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAuthor({ ...newAuthor, [name]: value });
  };

  const addAuthor = () => {
    if (!newAuthor.first_name.trim() || !newAuthor.last_name.trim()) {
      setError("Nome e sobrenome do autor são obrigatórios.");
      return;
    }
    
    setFormData({
      ...formData,
      authors: [...formData.authors, { ...newAuthor }],
    });
    setNewAuthor({ first_name: "", last_name: "", nationality: "" });
    setError("");
  };

  const removeAuthor = (index: number) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter((_, i) => i !== index),
    });
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title || !formData.isbn || !formData.category_id || !formData.publisher_id || !formData.copies) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const categoryId = parseInt(formData.category_id, 10);
    const publisherId = parseInt(formData.publisher_id, 10);
    const publicationYear = formData.publication_year ? parseInt(formData.publication_year, 10) : null;
    const copies = parseInt(formData.copies, 10);

    if (isNaN(categoryId) || isNaN(publisherId) || isNaN(copies) || copies < 1) {
      setError("Categoria, Editora e número de cópias são inválidos.");
      return;
    }

    const bookPayload = {
      title: formData.title,
      isbn: formData.isbn,
      category_id: categoryId,
      publisher_id: publisherId,
      publication_year: publicationYear,
      authors: formData.authors,
    };

    let book;
    try {
      // Step 1: Create the book
      const bookRes = await axios.post("http://localhost:3000/api/book", bookPayload);
      book = bookRes.data;
    } catch (err: any) {
      console.error('Erro ao adicionar livro:', err);
      let msg = "Falha ao adicionar livro.";
      if (err.response?.data?.message) {
        const detail = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
        msg += ` Detalhe: ${detail}`;
      }
      setError(msg);
      return; // Stop if book creation fails
    }

    try {
      // Step 2: Create multiple BookItems based on the number of copies
      const bookItemPromises = [];
      for (let i = 0; i < copies; i++) {
        const uniqueCode = `${book.isbn}-COPY-${i + 1}-${Math.random().toString(36).substr(2, 6)}`;
        bookItemPromises.push(
          axios.post("http://localhost:3000/api/book-item", {
            book_id: book.id,
            unique_code: uniqueCode,
            status: 'Available',
          })
        );
      }

      await Promise.all(bookItemPromises);

      // Reset form and refetch on full success
      setFormData({ title: "", isbn: "", publication_year: "", category_id: "", publisher_id: "", copies: "1", authors: [] });
      setError("");
      fetchBooks();
    } catch (err: any) {
      console.error('Erro ao adicionar exemplares:', err);
      let msg = "Livro adicionado, mas falha ao criar alguns exemplares.";
      if (err.response?.data?.message) {
        const detail = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
        msg += ` Detalhe: ${detail}`;
      }
      setError(msg);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      isbn: book.isbn,
      publication_year: book.publication_year?.toString() || "",
      category_id: book.Category?.id?.toString() || "",
      publisher_id: book.Publisher?.id?.toString() || "",
      copies: "1", // We don't edit copies in this form
      authors: book.authors.map((author) => ({
        first_name: author.first_name,
        last_name: author.last_name,
        nationality: author.nationality || "",
      })),
    });
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBook) return;

    if (!formData.title || !formData.isbn || !formData.category_id || !formData.publisher_id) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const categoryId = parseInt(formData.category_id, 10);
    const publisherId = parseInt(formData.publisher_id, 10);
    const publicationYear = formData.publication_year ? parseInt(formData.publication_year, 10) : null;

    if (isNaN(categoryId) || isNaN(publisherId)) {
      setError("Categoria e Editora são inválidos.");
      return;
    }

    const updatePayload = {
      title: formData.title,
      isbn: formData.isbn,
      category_id: categoryId,
      publisher_id: publisherId,
      publication_year: publicationYear,
      authors: formData.authors,
    };

    try {
      await axios.patch(`http://localhost:3000/api/book/${editingBook.id}`, updatePayload);
      setSuccess("Livro atualizado com sucesso!");
      setIsEditing(false);
      setEditingBook(null);
      setFormData({ title: "", isbn: "", publication_year: "", category_id: "", publisher_id: "", copies: "1", authors: [] });
      fetchBooks();
    } catch (err: any) {
      console.error('Erro ao atualizar livro:', err);
      let msg = "Falha ao atualizar livro.";
      if (err.response?.data?.message) {
        const detail = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
        msg += ` Detalhe: ${detail}`;
      }
      setError(msg);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o livro "${book.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/book/${book.id}`);
      setSuccess("Livro eliminado com sucesso!");
      fetchBooks();
    } catch (err: any) {
      console.error('Erro ao eliminar livro:', err);
      let msg = "Falha ao eliminar livro.";
      if (err.response?.data?.message) {
        const detail = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
        msg += ` Detalhe: ${detail}`;
      }
      setError(msg);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingBook(null);
    setFormData({ title: "", isbn: "", publication_year: "", category_id: "", publisher_id: "", copies: "1", authors: [] });
    setError("");
    setSuccess("");
  };

  const handleManageCopies = (book: Book) => {
    setSelectedBook(book);
    setShowCopyModal(true);
    setCopyAction('add');
    setCopyCount(1);
    setError("");
    setSuccess("");
  };

  const handleCopySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook) return;

    try {
      await axios.post(`http://localhost:3000/api/book/${selectedBook.id}/copies`, {
        action: copyAction,
        count: copyCount,
      });
      
      setSuccess(`Cópias ${copyAction === 'add' ? 'adicionadas' : 'removidas'} com sucesso!`);
      setShowCopyModal(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (err: any) {
      console.error('Erro ao gerir cópias:', err);
      let msg = `Falha ao ${copyAction === 'add' ? 'adicionar' : 'remover'} cópias.`;
      if (err.response?.data?.message) {
        msg += ` ${err.response.data.message}`;
      }
      setError(msg);
    }
  };

  const closeCopyModal = () => {
    setShowCopyModal(false);
    setSelectedBook(null);
    setError("");
    setSuccess("");
  };

  const handleViewBook = (book: Book) => {
    setViewingBook(book);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingBook(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isEditing ? 'Editar Obra' : 'Gestão de Obras'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isEditing ? 'Edite os detalhes da obra selecionada.' : 'Adicione, edite ou visualize os detalhes das obras da biblioteca.'}
          </p>
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={isEditing ? handleUpdateBook : handleAddBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Form fields */}
              <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Título da Obra" className="p-2 border rounded" required />
              <input name="isbn" value={formData.isbn} onChange={handleInputChange} placeholder="ISBN" className="p-2 border rounded" required />
              <input name="publication_year" value={formData.publication_year} onChange={handleInputChange} placeholder="Ano de Publicação" className="p-2 border rounded" type="number" />
              <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="p-2 border rounded" required>
                <option value="">Selecione a Categoria</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <select name="publisher_id" value={formData.publisher_id} onChange={handleInputChange} className="p-2 border rounded" required>
                <option value="">Selecione a Editora</option>
                {publishers.map((pub) => <option key={pub.id} value={pub.id}>{pub.name}</option>)}
              </select>
              {!isEditing && (
                <input name="copies" value={formData.copies} onChange={handleInputChange} placeholder="Número de Cópias" className="p-2 border rounded" type="number" min="1" required />
              )}
            </div>

            {/* Author Management Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Autores</h3>
              
              {/* Add Author Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  name="first_name"
                  value={newAuthor.first_name}
                  onChange={handleAuthorInputChange}
                  placeholder="Nome do Autor"
                  className="p-2 border rounded"
                />
                <input
                  name="last_name"
                  value={newAuthor.last_name}
                  onChange={handleAuthorInputChange}
                  placeholder="Sobrenome do Autor"
                  className="p-2 border rounded"
                />
                <input
                  name="nationality"
                  value={newAuthor.nationality}
                  onChange={handleAuthorInputChange}
                  placeholder="Nacionalidade (opcional)"
                  className="p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={addAuthor}
                  className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  Adicionar Autor
                </button>
              </div>

              {/* Authors List */}
              {formData.authors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Autores Adicionados:</h4>
                  <div className="space-y-2">
                    {formData.authors.map((author, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <span className="font-medium">{author.first_name} {author.last_name}</span>
                          {author.nationality && (
                            <span className="text-gray-600 ml-2">({author.nationality})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center gap-2">
                {isEditing ? 'Atualizar Obra' : 'Adicionar Obra'}
              </button>
              {isEditing && (
                <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                  Cancelar
                </button>
              )}
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Obras</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th-style">ISBN</th>
                  <th className="th-style">Título</th>
                  <th className="th-style">Autor</th>
                  <th className="th-style">Categoria</th>
                  <th className="th-style">Editora</th>
                  <th className="th-style">Ano</th>
                  <th className="th-style">Cópias Disponíveis</th>
                  <th className="th-style">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map((book) => {
                  const availableCopies = book.BookItem?.filter(item => item.status === 'Available').length || 0;
                  const totalCopies = book.BookItem?.length || 0;
                  return (
                    <tr key={book.id}>
                      <td className="td-style">{book.isbn}</td>
                      <td className="td-style font-medium">{book.title}</td>
                      <td className="td-style">{book.author}</td>
                      <td className="td-style">{book.Category?.name || 'N/A'}</td>
                      <td className="td-style">{book.Publisher?.name || 'N/A'}</td>
                      <td className="td-style">{book.publication_year || 'N/A'}</td>
                      <td className="td-style">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          availableCopies > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {availableCopies}/{totalCopies}
                        </span>
                      </td>
                      <td className="td-style">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleViewBook(book)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Ver Detalhes"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleEditBook(book)} 
                            className="text-blue-600 hover:text-blue-800"
                            disabled={isEditing}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleManageCopies(book)} 
                            className="text-green-600 hover:text-green-800"
                            disabled={isEditing}
                            title="Gerir Cópias"
                          >
                            📚
                          </button>
                          <button 
                            onClick={() => handleDeleteBook(book)} 
                            className="text-red-600 hover:text-red-800"
                            disabled={isEditing}
                            title="Eliminar"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Copy Management Modal */}
      {showCopyModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Gerir Cópias - {selectedBook.title}
            </h2>
            
            <form onSubmit={handleCopySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ação
                </label>
                <select 
                  value={copyAction} 
                  onChange={(e) => setCopyAction(e.target.value as 'add' | 'remove')}
                  className="w-full p-2 border rounded"
                >
                  <option value="add">Adicionar Cópias</option>
                  <option value="remove">Remover Cópias</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cópias
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={copyCount} 
                  onChange={(e) => setCopyCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirmar
                </button>
                <button 
                  type="button" 
                  onClick={closeCopyModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
            
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}

      {/* Book Details View Modal */}
      {showViewModal && viewingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Detalhes da Obra</h2>
              <button
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{viewingBook.title}</h3>
                <p className="text-gray-600">{viewingBook.author}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ISBN</label>
                  <p className="text-gray-900">{viewingBook.isbn}</p>
                </div>
                {viewingBook.publication_year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ano de Publicação</label>
                    <p className="text-gray-900">{viewingBook.publication_year}</p>
                  </div>
                )}
                {viewingBook.Category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <p className="text-gray-900">{viewingBook.Category.name}</p>
                  </div>
                )}
                {viewingBook.Publisher && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Editora</label>
                    <p className="text-gray-900">{viewingBook.Publisher.name}</p>
                  </div>
                )}
              </div>

              {/* Authors Section */}
              {viewingBook.authors && viewingBook.authors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Autores</label>
                  <div className="space-y-2">
                    {viewingBook.authors.map((author, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <span className="font-medium">{author.first_name} {author.last_name}</span>
                        {author.nationality && (
                          <span className="text-gray-600 ml-2">({author.nationality})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Book Items Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exemplares</label>
                <div className="space-y-2">
                  {viewingBook.BookItem && viewingBook.BookItem.length > 0 ? (
                    viewingBook.BookItem.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          Exemplar {index + 1}
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
      
       <style jsx>{`
        .th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: bold; color: #4b5563; text-transform: uppercase; }
        .td-style { padding: 1rem 1rem; white-space: nowrap; font-size: 0.875rem; color: #4b5563; }
      `}</style>
    </div>
  );
};

export default BookManagement; 