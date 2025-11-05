import React from 'react';
import { User, UserRole } from '../types';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onUpdateUserRole: (username: string, role: UserRole) => void;
  onDeleteUser: (username: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ users, currentUser, onUpdateUserRole, onDeleteUser }) => {
  const roles: UserRole[] = ['student', 'teacher', 'admin'];
  const roleNames: {[key in UserRole]: string} = {
    student: 'Học viên',
    teacher: 'Giáo viên',
    admin: 'Quản trị viên'
  }

  return (
    <div className="bg-secondary p-6 rounded-lg h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold text-highlight mb-6">Quản lý người dùng</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-accent">
          <thead className="bg-accent">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tên đăng nhập</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Vai trò</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary divide-y divide-accent">
            {users.map((user) => (
              <tr key={user.username} className="hover:bg-accent transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  <select
                    value={user.role}
                    onChange={(e) => onUpdateUserRole(user.username, e.target.value as UserRole)}
                    disabled={user.username === currentUser.username}
                    className="bg-primary text-text-primary rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-highlight disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {roles.map(role => (
                      <option key={role} value={role} className="capitalize">{roleNames[role]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDeleteUser(user.username)}
                    disabled={user.username === currentUser.username}
                    className="text-red-500 hover:text-red-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                    title={user.username === currentUser.username ? "Không thể xóa chính bạn" : "Xóa người dùng"}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementView;
