import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MoodForm from '../components/MoodForm';

const MoodFlow: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Registro de Estado de Ánimo</h1>
                <p className="text-sm text-gray-600">Comparte cómo te sientes hoy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MoodForm />
      </div>
    </div>
  );
};

export default MoodFlow;
