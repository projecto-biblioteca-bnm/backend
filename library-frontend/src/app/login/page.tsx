'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

const socialIcons = [
	{
		href: '#',
		label: 'Facebook',
		icon: (
			<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
				<path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
			</svg>
		),
	},
	{
		href: '#',
		label: 'Twitter',
		icon: (
			<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
				<path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 00-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.209c9.058 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0024 4.557z" />
			</svg>
		),
	},
	{
		href: '#',
		label: 'Instagram',
		icon: (
			<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32 1.28.059 1.689.072 7.191.072s5.911-.013 7.191-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191s-.013-5.911-.072-7.191c-.059-1.277-.353-2.45-1.32-3.417C21.398.425 20.225.131 18.948.072 17.668.013 17.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
			</svg>
		),
	},
	{
		href: '#',
		label: 'LinkedIn',
		icon: (
			<svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
				<path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76c.97 0 1.75.79 1.75 1.76s-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
			</svg>
		),
	},
];

const LoginPage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		console.log('Submitting login form');
		try {
			const response = await api.post('/auth/login', { username, password });
			const { access_token } = response.data;
			console.log('Full login response data:', response.data);
			console.log('user_type:', response.data?.user?.user_type);

			const userType = response.data?.user?.user_type || response.data?.user_type;

			// Store JWT and user info
			localStorage.setItem('token', access_token);
			localStorage.setItem('user', JSON.stringify(response.data.user));
			localStorage.setItem('user_type', userType);

			if (
				["TechnicalStaff", "ChefeDeReparticao", "ChefeDeDepartamento"].includes(userType)
			) {
				console.log('Redirecting to /select-profile');
				router.push('/select-profile');
			} else {
				console.log('User type not matching:', userType);
			}
		} catch (err) {
			setError('Falha no login. Verifique suas credenciais.');
			console.error('Login error:', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center bg-cover bg-center"
			style={{ backgroundImage: 'url(/bnm05.jpg)' }}
		>
			<div className="bg-white bg-opacity-95 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
				<div className="w-full flex justify-between items-center mb-2">
					<h1 className="text-2xl sm:text-2xl font-bold text-blue-700 leading-tight">
						Sistema de Gestão
						<br />
						de Biblioteca
					</h1>
					<span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full ml-2">
						v1.0
					</span>
				</div>
				<form
					className="w-full mt-4 space-y-4"
					onSubmit={handleSubmit}
				>
					{error && (
						<div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
							{error}
						</div>
					)}
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Nome de Usuário
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Senha
						</label>
						<div className="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 text-gray-900 placeholder-gray-400"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(v => !v)}
								className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 focus:outline-none"
								tabIndex={-1}
							>
								{showPassword ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m1.662-2.662A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-1.662 2.662A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
					<div className="flex justify-end">
						<Link
							href="/forgot-password"
							className="text-blue-600 text-sm hover:underline"
						>
							Esqueceu a senha?
						</Link>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors duration-200 mt-2 disabled:opacity-50"
					>
						{loading ? 'Entrando...' : 'Entrar'}
					</button>
				</form>
				<div className="flex justify-center space-x-4 mt-6">
					{socialIcons.map((icon, idx) => (
						<a
							key={idx}
							href={icon.href}
							aria-label={icon.label}
							className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
						>
							{icon.icon}
						</a>
					))}
				</div>
				<footer className="mt-6 text-xs text-gray-400 text-center">
					© 2025 Sistema de Gestão de Biblioteca. Todos os direitos reservados.
				</footer>
				<p className="text-center">
					Não tem uma conta?{' '}
					<Link href="/register" className="text-indigo-600 hover:text-indigo-500">
						Registe-se
					</Link>
				</p>
				<p className="text-center mt-4">
					<Link href="/public" className="text-indigo-600 hover:text-indigo-500">
						Acessar o Portal Público
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
