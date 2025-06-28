'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('Se existir uma conta com este email, um link para redefinir a senha foi enviado.');
        } catch (err: any) {
            // We show a generic message to prevent email enumeration
            // but we can log the specific error for debugging.
            console.error('Forgot password error:', err);
            setError('Ocorreu um erro ao tentar enviar o email. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Redefinir Senha</h2>
                
                {message ? (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                        <p className="text-green-700 bg-green-50 p-4 rounded-md">{message}</p>
                        <Link href="/login" className="mt-6 inline-block text-blue-600 hover:underline">
                           Voltar ao Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-center text-gray-600">
                            Por favor, insira o seu endereço de email para receber um link de redefinição de senha.
                        </p>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu.email@exemplo.com"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center text-sm">
                                <FaExclamationCircle className="mr-2" /> {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'A Enviar...' : 'Enviar Link de Redefinição'}
                                {!loading && <FaPaperPlane />}
                            </button>
                        </div>
                    </form>
                )}

                {!message && (
                     <div className="text-center mt-6">
                        <Link href="/login" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2">
                           <FaArrowLeft /> Voltar ao Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
