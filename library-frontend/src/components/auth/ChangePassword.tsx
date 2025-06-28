import React, { useState } from 'react';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('A nova senha e a confirmação não correspondem.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // Fetch user info to get the user ID
            const meRes = await fetch('http://localhost:3000/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const me = await meRes.json();
            console.log('me:', me);
            const userId = me.id;
            if (!userId) {
                setError('Não foi possível obter o ID do usuário.');
                return;
            }
            const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Erro ao alterar senha.');
                return;
            }
            setSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError('Erro ao conectar ao servidor.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Alterar Senha</h1>
            <p className="text-gray-600 mb-6">
                Preencha os campos abaixo para alterar a sua senha.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label 
                        htmlFor="current-password" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Senha Atual:
                    </label>
                    <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Sua senha atual"
                    />
                </div>

                <div>
                    <label 
                        htmlFor="new-password" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Nova Senha:
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Sua nova senha"
                    />
                </div>

                <div>
                    <label 
                        htmlFor="confirm-password" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Confirmar Nova Senha:
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirme sua nova senha"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Alterar Senha
                    </button>
                </div>
            </form>
        </div>
    );
} 