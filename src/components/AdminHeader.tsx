import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Settings, Home, Bell, LogOut } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuthContext();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/admin" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Users
                </Link>
                <Link
                  to="/admin/settings"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900"
              title="Back to App"
            >
              <Home className="h-5 w-5" />
            </Link>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform -translate-y-1/2 translate-x-1/2"></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-700">
                {user?.email || user?.phoneNumber}
              </div>
              <button
                onClick={() => logout()}
                className="text-gray-600 hover:text-gray-900"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;