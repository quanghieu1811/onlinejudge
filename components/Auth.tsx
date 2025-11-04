import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  authService: {
    getUsers: () => User[];
    saveUsers: (users: User[]) => void;
  };
}

const Auth: React.FC<AuthProps> = ({ onLogin, authService }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Tên đăng nhập và mật khẩu không được để trống.');
      return;
    }

    const users = authService.getUsers();

    if (isLoginView) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } else {
      // Register
      if (users.some(u => u.username === username)) {
        setError('Tên đăng nhập đã tồn tại.');
        return;
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        password, // In a real app, hash this password!
        role: 'user'
      };
      const updatedUsers = [...users, newUser];
      authService.saveUsers(updatedUsers);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-lg shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-highlight">Welcome to Gemini Judge</h1>
            <p className="text-text-secondary mt-2">
                {isLoginView ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
            </p>
        </div>
        
        <div className="flex justify-center border-b border-accent">
          <button 
            onClick={() => { setIsLoginView(true); setError(null); }}
            className={`px-6 py-2 font-semibold transition-colors ${isLoginView ? 'text-highlight border-b-2 border-highlight' : 'text-text-secondary'}`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setIsLoginView(false); setError(null); }}
            className={`px-6 py-2 font-semibold transition-colors ${!isLoginView ? 'text-highlight border-b-2 border-highlight' : 'text-text-secondary'}`}
          >
            Đăng ký
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-sm font-medium text-text-primary block mb-2">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-accent border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-text-primary block mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-accent border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent"
            />
          </div>
          
          {error && <p className="text-sm text-red-400">{error}</p>}
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-highlight hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight transition-colors"
            >
              {isLoginView ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
