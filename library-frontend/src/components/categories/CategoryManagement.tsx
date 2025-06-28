"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';

interface Category {
    id: number;
    name: string;
    description: string | null;
}

const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/category");
            setCategories(response.data);
        } catch (err) {
            setError("Falha ao buscar categorias.");
            console.error(err);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            setError("O nome da categoria é obrigatório.");
            return;
        }
        try {
            await axios.post("http://localhost:3000/api/category", {
                name: categoryName,
                description: description,
            });
            setCategoryName("");
            setDescription("");
            setError("");
            fetchCategories(); // Refresh the list
        } catch (err) {
            setError("Falha ao adicionar categoria.");
            console.error(err);
        }
    };

    // Edit and Delete handlers
    const handleEditCategory = async (id: number, updatedData: Partial<Category>) => {
        try {
            await axios.patch(`http://localhost:3000/api/category/${id}`, updatedData);
            fetchCategories();
            setError("");
        } catch (err) {
            setError("Falha ao editar categoria.");
            console.error(err);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            await axios.delete(`http://localhost:3000/api/category/${id}`);
            fetchCategories();
            setError("");
        } catch (err) {
            setError("Falha ao eliminar categoria.");
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestão de Categorias</h1>
                    <p className="text-gray-600 mb-6">
                        Adicione, edite ou remova as categorias de obras da biblioteca.
                    </p>

                    <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
                        <div className="md:col-span-1">
                            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
                            <input
                                id="categoryName"
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Ex: Ficção Científica"
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                            <input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Livros sobre futuros distópicos"
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="md:col-span-1 h-10 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                        >
                            <FaPlus /> Adicionar
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Categorias</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Descrição</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                            <div className="flex items-center gap-4">
                                                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1" onClick={() => {
                                                    const newName = prompt('Novo nome da categoria:', category.name);
                                                    if (newName && newName.trim() && newName !== category.name) {
                                                        handleEditCategory(category.id, { name: newName });
                                                    }
                                                }}>
                                                    <FaEdit /> Editar
                                                </button>
                                                <button className="text-red-600 hover:text-red-800 flex items-center gap-1" onClick={() => {
                                                    if (window.confirm('Tem certeza que deseja eliminar esta categoria?')) {
                                                        handleDeleteCategory(category.id);
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
        </div>
    );
};

export default CategoryManagement; 