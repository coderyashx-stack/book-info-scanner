
import React from 'react';
import { Book } from '../types';
import { LibraryIcon } from './icons/LibraryIcon';

interface LibraryCollectionProps {
  books: Book[];
  onUpdateStatus: (bookId: string, status: 'available' | 'checked_out') => void;
  onRemove: (bookId: string) => void;
}

const LibraryCollection: React.FC<LibraryCollectionProps> = ({ books, onUpdateStatus, onRemove }) => {

  const exportToCSV = () => {
    const headers = ['ISBN', 'Title', 'Authors', 'Publisher', 'PublishedDate', 'Status'];
    const rows = books.map(book => [
        `"${book.isbn}"`,
        `"${book.title.replace(/"/g, '""')}"`,
        `"${book.authors.join(', ')}"`,
        `"${(book.publisher || '').replace(/"/g, '""')}"`,
        `"${book.publishedDate || ''}"`,
        `"${book.status}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "library_collection.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <LibraryIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">Your library is empty</h3>
        <p className="mt-1 text-sm text-slate-500">Add books by searching or scanning a barcode.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">My Library</h2>
        <button 
          onClick={exportToCSV}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Export as CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cover</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title & Author</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={book.imageLinks?.smallThumbnail || `https://picsum.photos/seed/${book.id}/40/60`} 
                    alt={book.title} 
                    className="h-16 w-12 object-cover rounded-sm"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{book.title}</div>
                  <div className="text-sm text-slate-500">{book.authors.join(', ')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {book.status === 'available' ? 'Available' : 'Checked Out'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {book.status === 'available' ? (
                    <button onClick={() => onUpdateStatus(book.id, 'checked_out')} className="text-indigo-600 hover:text-indigo-900">Check Out</button>
                  ) : (
                    <button onClick={() => onUpdateStatus(book.id, 'available')} className="text-green-600 hover:text-green-900">Return</button>
                  )}
                  <button onClick={() => onRemove(book.id)} className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LibraryCollection;
