import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 Mood Log App. All rights reserved.</p>
          <p className="mt-1">Track your mood, improve your mental health.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
