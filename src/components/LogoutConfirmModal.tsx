import { FiX, FiLogOut, FiAlertTriangle } from 'react-icons/fi';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">确认退出</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <FiLogOut className="w-6 h-6 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                您确定要退出登录吗？
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                退出后需要重新登录才能访问系统。
              </p>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>确认退出</span>
          </button>
        </div>
      </div>
    </div>
  );
} 