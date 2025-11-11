
import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';


interface BookSearchProps {
  onSearch: (isbn: string) => void;
  isLoading: boolean;
}

const BookSearch: React.FC<BookSearchProps> = ({ onSearch, isLoading }) => {
  const [isbn, setIsbn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isbn.trim()) {
      onSearch(isbn.trim());
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Search by ISBN</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Enter book ISBN..."
                className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={isLoading}
            />
            <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Searching...
                    </>
                ) : (
                    <>
                        <SearchIcon className="-ml-1 mr-2 h-5 w-5" />
                        Search
                    </>
                )}
            </button>
        </form>
    </div>
  );
};

export default BookSearch;
