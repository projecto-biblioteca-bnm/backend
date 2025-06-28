import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserEdit, FaTrash, FaLock, FaEye, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

interface Reader {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'Reader';
  phone?: string;
  birth_date?: string;
  status?: 'Ativo' | 'Bloqueado'; // For UI only
}

const API_URL = 'http://localhost:3000/api/users';

export default function ReaderManagement() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add state for Add Reader form
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newReader, setNewReader] = useState({
    username: '',
    email: '',
    phone: '',
  });
  const [addMessage, setAddMessage] = useState<string | null>(null);

  // Edit Reader state
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editReader, setEditReader] = useState<Reader | null>(null);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editIdInput, setEditIdInput] = useState('');
  const [isEditIdMode, setIsEditIdMode] = useState(false);

  // Delete Reader state
  const [isDeleteIdMode, setIsDeleteIdMode] = useState(false);
  const [deleteIdInput, setDeleteIdInput] = useState('');
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // Utility to refresh readers from backend
  const fetchReaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erro ao buscar leitores');
      const users = await res.json();
      const onlyReaders = users.filter((u: any) => u.user_type === 'Reader');
      setReaders(onlyReaders);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReaders();
  }, []);

  // Handler for opening the Add Reader form
  const handleAddClick = () => {
    setIsAddFormOpen(true);
    setAddMessage(null);
    setIsEditFormOpen(false);
    setEditReader(null);
    setIsEditIdMode(false);
    setIsDeleteIdMode(false);
  };

  // Handler for opening the Edit Reader form by row icon
  const handleRowEdit = (reader: Reader) => {
    setEditReader(reader);
    setIsEditFormOpen(true);
    setIsAddFormOpen(false);
    setEditMessage(null);
    setIsEditIdMode(false);
  };

  // Handler for opening the Edit Reader form by button (ID mode)
  const handleEditByIdClick = () => {
    setIsEditIdMode(true);
    setIsEditFormOpen(false);
    setIsAddFormOpen(false);
    setEditIdInput('');
    setEditMessage(null);
  };

  // Handler for input changes in the Edit Reader form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editReader) {
      setEditReader({ ...editReader, [name]: value } as Reader);
    }
  };

  // Handler for submitting the Edit Reader form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReader) return;

    if (!editReader.first_name || !editReader.last_name || !editReader.email) {
      setEditMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Create a clean payload with only allowed fields
    const payload = {
      first_name: editReader.first_name,
      last_name: editReader.last_name,
      email: editReader.email,
      phone: editReader.phone,
      birth_date: editReader.birth_date ? new Date(editReader.birth_date).toISOString() : undefined,
    };

    try {
      const res = await fetch(`${API_URL}/${editReader.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData; // Throw the full error object from the backend
      }

      setEditMessage('Leitor atualizado com sucesso!');
      setIsEditFormOpen(false);
      setEditReader(null);
      // Refresh list
      await fetchReaders();
    } catch (err: any) {
      let detail = 'Ocorreu um erro inesperado.';
      if (err && err.message) {
        const message = err.message;
        if (Array.isArray(message)) {
          detail = message.join(', ');
        } else if (typeof message === 'string') {
          detail = message;
        } else {
          detail = JSON.stringify(message);
        }
      }
      setEditMessage(`Falha ao atualizar: ${detail}`);
    }
    setTimeout(() => setEditMessage(null), 3000);
  };

  // Handler for input changes in the Add Reader form
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReader((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for submitting the Add Reader form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!newReader.username || !newReader.email) {
      setAddMessage('Por favor, preencha o nome de usuário e o email.');
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newReader.username,
          email: newReader.email,
          phone: newReader.phone,
          first_name: 'indefinido',
          last_name: 'indefinido',
          password: 'undefined123',
          user_type: 'Reader',
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData; // Throw the full error object from the backend
      }
      setAddMessage('Leitor adicionado com sucesso!');
      setIsAddFormOpen(false);
      setNewReader({ username: '', email: '', phone: '' });
      await fetchReaders();
    } catch (err: any) {
      let detail = 'Ocorreu um erro inesperado.';
       if (err && err.message) {
        const message = err.message;
        if (Array.isArray(message)) {
          detail = message.join(', ');
        } else if (typeof message === 'string') {
          detail = message;
        } else {
          detail = JSON.stringify(message);
        }
      }
      setAddMessage(`Falha ao adicionar leitor: ${detail}`);
    }
    setTimeout(() => setAddMessage(null), 2000);
  };

  // Handler for opening the Delete Reader form by button (ID mode)
  const handleDeleteByIdClick = () => {
    setIsDeleteIdMode(true);
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setIsEditIdMode(false);
    setDeleteIdInput('');
    setDeleteMessage(null);
  };

  // Handler for submitting the ID to delete reader
  const handleDeleteIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = readers.find(r => r.id === Number(deleteIdInput.trim()));
    if (found) {
      await handleRowDelete(found);
      setDeleteIdInput('');
    } else {
      setDeleteMessage('Leitor não encontrado com esse ID.');
      setTimeout(() => setDeleteMessage(null), 2000);
    }
  };

  // Handler for row delete icon
  const handleRowDelete = async (reader: Reader) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o leitor ${reader.first_name} ${reader.last_name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/${reader.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao eliminar leitor');
      setDeleteMessage('Leitor eliminado com sucesso!');
      // Refresh list
      await fetchReaders();
    } catch (err: any) {
      setDeleteMessage(err.message || 'Erro desconhecido');
    }
    setTimeout(() => setDeleteMessage(null), 2000);
  };

  // Handler for submitting the ID to find reader (edit by ID)
  const handleEditIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = readers.find(r => r.id === Number(editIdInput.trim()));
    if (found) {
      setEditReader(found);
      setIsEditFormOpen(true);
      setIsEditIdMode(false);
      setEditMessage(null);
    } else {
      setEditMessage('Leitor não encontrado com esse ID.');
      setTimeout(() => setEditMessage(null), 2000);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gerir Leitores</h1>
        <p className="text-gray-600">
          Gerencie os leitores da biblioteca: adicione, edite, elimine e bloqueie o acesso.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={handleAddClick}
        >
          <FaUserPlus />
          Adicionar Leitor
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={handleEditByIdClick}
        >
          <FaUserEdit />
          Editar Leitor
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          onClick={handleDeleteByIdClick}
        >
          <FaTrash />
          Eliminar Leitor
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          onClick={fetchReaders}
        >
          <FaUserPlus />
          Listar Leitores
        </button>
      </div>

      {/* Add Reader Form */}
      {isAddFormOpen && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 bg-white rounded shadow-md">
          <h3 className="text-lg font-semibold mb-4">Adicionar Novo Leitor</h3>
          {addMessage && <div className={`p-2 mb-4 rounded ${addMessage.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{addMessage}</div>}
          <div className="flex gap-4 mb-4">
            <input name="username" value={newReader.username} onChange={handleAddInputChange} placeholder="Nome de Usuário" required className="border rounded px-3 py-2 flex-1" />
            <input name="email" type="email" value={newReader.email} onChange={handleAddInputChange} placeholder="Email" required className="border rounded px-3 py-2 flex-1" />
            <input name="phone" value={newReader.phone} onChange={handleAddInputChange} placeholder="Telefone" className="border rounded px-3 py-2 flex-1" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar Leitor</button>
            <button type="button" onClick={() => setIsAddFormOpen(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
          </div>
        </form>
      )}

      {/* Edit Reader by ID Form */}
      {isEditIdMode && (
        <div className="mb-6 bg-gray-50 p-4 rounded shadow">
          <form onSubmit={handleEditIdSubmit} className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Digite o ID do leitor"
              value={editIdInput}
              onChange={e => setEditIdInput(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Buscar</button>
            <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setIsEditIdMode(false)}>Cancelar</button>
            {editMessage && <div className="text-red-600 ml-4">{editMessage}</div>}
          </form>
        </div>
      )}

      {/* Edit Reader Form */}
      {isEditFormOpen && editReader && (
        <div className="mb-6 bg-gray-50 p-4 rounded shadow">
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                name="first_name"
                placeholder="Nome"
                value={editReader.first_name}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Sobrenome"
                value={editReader.last_name}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editReader.email}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="text"
                name="username"
                placeholder="Nome de usuário"
                value={editReader.username}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="text"
                name="phone"
                placeholder="Telefone"
                value={editReader.phone}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="date"
                name="birth_date"
                placeholder="Data de nascimento"
                value={editReader.birth_date}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2 flex-1"
              />
              <select
                name="status"
                value={editReader.status}
                onChange={handleEditInputChange}
                className="border rounded px-3 py-2"
              >
                <option value="Ativo">Ativo</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar</button>
              <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => { setIsEditFormOpen(false); setEditReader(null); }}>Cancelar</button>
            </div>
            {editMessage && <div className="text-green-600">{editMessage}</div>}
          </form>
        </div>
      )}

      {/* Delete Reader by ID Form */}
      {isDeleteIdMode && (
        <div className="mb-6 bg-gray-50 p-4 rounded shadow">
          <form onSubmit={handleDeleteIdSubmit} className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Digite o ID do leitor para eliminar"
              value={deleteIdInput}
              onChange={e => setDeleteIdInput(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
            <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setIsDeleteIdMode(false)}>Cancelar</button>
            {deleteMessage && <div className="text-green-600 ml-4">{deleteMessage}</div>}
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Lista de Leitores</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">NOME</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">EMAIL</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">TELEFONE</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">STATUS</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {readers.map((reader) => (
                  <tr key={reader.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{reader.id}</td>
                    <td className="px-4 py-2">{reader.username}</td>
                    <td className="px-4 py-2">{reader.email}</td>
                    <td className="px-4 py-2">{reader.phone}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${reader.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {reader.status || 'Ativo'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-blue-500" title="Visualizar">
                          <FaEye size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-blue-500" title="Editar" onClick={() => handleRowEdit(reader)}>
                          <FaPencilAlt size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-red-500" title="Eliminar" onClick={() => handleRowDelete(reader)}>
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 