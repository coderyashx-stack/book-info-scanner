
import React from 'react';
import { Book } from '../types';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
  onAdd: (book: Book) => void;
  onRemove: (bookId: string) => void;
  isInLibrary: boolean;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, onBack, onAdd, onRemove, isInLibrary }) => {
  const coverImage = book.imageLinks?.thumbnail || `https://picsum.photos/seed/${book.id}/200/300`;

  const DetailItem: React.FC<{ label: string; value?: string | number | string[] }> = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="py-2">
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900">{Array.isArray(value) ? value.join(', ') : value}</dd>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
          &larr; Back to Search
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        <div className="md:w-1/3 flex-shrink-0">
          <img className="w-full h-auto object-cover md:h-full" src={coverImage} alt={`Cover of ${book.title}`} />
        </div>
        <div className="p-6 md:p-8 flex flex-col">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{book.title}</h1>
            <p className="mt-1 text-lg text-slate-600">by {book.authors.join(', ')}</p>
          </div>
          
          <div className="mt-4 prose prose-slate max-w-none text-slate-700">
             <p>{book.description || 'No description available.'}</p>
          </div>

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <DetailItem label="Publisher" value={book.publisher} />
            <DetailItem label="Published Date" value={book.publishedDate} />
            <DetailItem label="Categories" value={book.categories} />
            <DetailItem label="Page Count" value={book.pageCount} />
            <DetailItem label="ISBN" value={book.isbn} />
          </dl>

          <div className="mt-auto pt-6">
            {isInLibrary ? (
              <button
                onClick={() => onRemove(book.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
              >
                Remove from Library
              </button>
            ) : (
              <button
                onClick={() => onAdd(book)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Add to Library
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
