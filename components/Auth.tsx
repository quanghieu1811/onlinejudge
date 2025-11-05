import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ users, onLogin, onRegister }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLoginView) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
      }
    } else {
      if (users.some(u => u.username === username)) {
        setError('Tên đăng nhập đã tồn tại.');
      } else if (username.length < 3 || password.length < 4) {
        setError('Tên đăng nhập cần ít nhất 3 ký tự, mật khẩu cần ít nhất 4 ký tự.');
      }
      else {
        const newUser: User = { username, password, role: 'student' }; // Default role is student
        onRegister(newUser);
        // Automatically log in the new user
        onLogin(newUser);
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="w-full max-w-md bg-secondary p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-highlight mb-6">
          {isLoginView ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
          </div>
          {error && <p className="text-red-400 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-highlight text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors"
            >
              {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError(null);
              }}
              className="inline-block align-baseline font-bold text-sm text-text-secondary hover:text-text-primary"
            >
              {isLoginView ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;