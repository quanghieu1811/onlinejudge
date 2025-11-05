import React, { useState, useEffect } from 'react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Reset state when modal is opened or closed
        if (isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError(null);
            setIsLoading(false);
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSuccess(false);

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không khớp.");
            return;
        }
        if (newPassword.length < 4) { // Basic validation
             setError("Mật khẩu mới phải có ít nhất 4 ký tự.");
             return;
        }

        setIsLoading(true);
        try {
            await onSubmit(currentPassword, newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500); // Close modal after success message
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi không mong muốn.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-accent flex justify-between items-center">
                    <h2 className="text-xl font-bold text-highlight">Đổi mật khẩu</h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="current-password">
                            Mật khẩu hiện tại
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                            required
                        />
                    </div>
                     <div className="mb-4">
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="new-password">
                            Mật khẩu mới
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                            required
                        />
                    </div>
                     <div className="mb-6">
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="confirm-password">
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-accent text-text-primary px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-xs italic mb-4">{error}</p>}
                    {isSuccess && <p className="text-green-400 text-xs italic mb-4">Cập nhật mật khẩu thành công!</p>}
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-highlight text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors disabled:bg-gray-500"
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
