import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Home, 
  Shield, 
  BarChart2, 
  Bell, 
  HelpCircle, 
  FileText,
  Database,
  Key
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: BarChart2,
      exact: true
    },
    { 
      name: 'User Management', 
      path: '/admin/users', 
      icon: Users 
    },
    { 
      name: 'Security', 
      path: '/admin/security', 
      icon: Shield 
    },
    { 
      name: 'API Keys', 
      path: '/admin/api-keys', 
      icon: Key 
    },
    { 
      name: 'Database', 
      path: '/admin/database', 
      icon: Database 
    },
    { 
      name: 'Notifications', 
      path: '/admin/notifications', 
      icon: Bell 
    },
    { 
      name: 'System Settings', 
      path: '/admin/settings', 
      icon: Settings 
    },
    { 
      name: 'Logs', 
      path: '/admin/logs', 
      icon: FileText 
    },
    { 
      name: 'Help', 
      path: '/admin/help', 
      icon: HelpCircle 
    }
  ];

  return (
    <div className="h-screen w-64 bg-gray-800 text-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <Link to="/admin" className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-xs text-gray-400">Excel Pro AI</p>
          </div>
        </Link>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 py-2">
          <h3 className="text-xs uppercase tracking-wider text-gray-500">Main</h3>
        </div>
        
        <Link
          to="/"
          className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Home className="h-5 w-5 mr-3" />
          <span>Back to App</span>
        </Link>
        
        <div className="px-4 py-2 mt-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500">Admin</h3>
        </div>
        
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 transition-colors ${
              (item.exact ? isActive(item.path) : location.pathname.startsWith(item.path))
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Admin Panel v1.0.0
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;