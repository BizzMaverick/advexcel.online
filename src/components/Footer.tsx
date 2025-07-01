import { Mail, GitHub, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Excel Pro AI. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Mail className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <GitHub className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          <p className="flex items-center justify-center">
            Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> for spreadsheet enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;