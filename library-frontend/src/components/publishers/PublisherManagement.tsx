"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';

interface Publisher {
  id: number;
  name: string;
}

const PublisherManagement = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/publisher");
      setPublishers(response.data);
    } catch (err) {
      setError("Falha ao buscar editoras.");
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPublisher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("O nome da editora é obrigatório.");
      return;
    }
    try {
      await axios.post("http://localhost:3000/api/publisher", { name: formData.name });
      setFormData({ name: "" });
      setError("");
      fetchPublishers(); // Refresh the list
    } catch (err) {
      setError("Falha ao adicionar editora.");
      console.error(err);
    }
  };

  const handleEditPublisher = async (id: number, updatedData: Partial<Publisher>) => {
    try {
      await axios.patch(`http://localhost:3000/api/publisher/${id}`, updatedData);
      fetchPublishers();
      setError("");
    } catch (err) {
      setError("Falha ao editar editora.");
      console.error(err);
    }
  };

  const handleDeletePublisher = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/publisher/${id}`);
      fetchPublishers();
      setError("");
    } catch (err) {
      setError("Falha ao eliminar editora.");
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestão de Editoras</h1>
          <p className="text-gray-600 mb-6">
            Adicione, edite ou remova as editoras parceiras da biblioteca.
          </p>

          <form onSubmit={handleAddPublisher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Editora</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Ex: Editora Atlas" className="mt-1 w-full input-style" required />
              </div>
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
              <FaPlus /> Adicionar Editora
            </button>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Editoras</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th-style">ID</th>
                  <th className="th-style">Nome</th>
                  <th className="th-style">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {publishers.map((publisher) => (
                  <tr key={publisher.id}>
                    <td className="td-style">{publisher.id}</td>
                    <td className="td-style font-medium text-gray-900">{publisher.name}</td>
                    <td className="td-style">
                      <div className="flex items-center gap-4">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1" onClick={() => {
                          const newName = prompt('Novo nome da editora:', publisher.name);
                          if (newName && newName.trim() && newName !== publisher.name) {
                            handleEditPublisher(publisher.id, { name: newName });
                          }
                        }}>
                          <FaEdit /> Editar
                        </button>
                        <button className="text-red-600 hover:text-red-800 flex items-center gap-1" onClick={() => {
                          if (window.confirm('Tem certeza que deseja eliminar esta editora?')) {
                            handleDeletePublisher(publisher.id);
                          }
                        }}>
                          <FaTrashAlt /> Eliminar
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
      <style jsx>{`
        .input-style {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          width: 100%;
          outline: none;
        }
        .input-style:focus {
          ring: 2px;
          ring-color: #3b82f6;
          border-color: #3b82f6;
        }
        .th-style {
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: bold;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .td-style {
          padding: 1rem 1.5rem;
          white-space: nowrap;
          font-size: 0.875rem;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default PublisherManagement; 