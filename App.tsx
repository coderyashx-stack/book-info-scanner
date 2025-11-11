
import React, { useState, useCallback } from 'react';
import { Book } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchBookByISBN } from './services/googleBooksService';
import Header from './components/Header';
import BookSearch from './components/BookSearch';
import Scanner from './components/Scanner';
import BookDetails from './components/BookDetails';
import LibraryCollection from './components/LibraryCollection';

type View = 'search' | 'scanner' | 'details' | 'collection';
type MainTab = 'search' | 'collection';

const App: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [library, setLibrary] = useLocalStorage<Book[]>('library:books', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('search');
  const [mainTab, setMainTab] = useState<MainTab>('search');

  const handleSearch = useCallback(async (isbn: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const book = await fetchBookByISBN(isbn);
      setSelectedBook(book);
      setCurrentView('details');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setSelectedBook(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddToLibrary = (book: Book) => {
    if (!library.some(b => b.id === book.id)) {
      setLibrary([...library, book]);
    }
  };

  const handleRemoveFromLibrary = (bookId: string) => {
    setLibrary(library.filter(b => b.id !== bookId));
  };
  
  const handleUpdateBookStatus = (bookId: string, status: 'available' | 'checked_out') => {
    setLibrary(library.map(book => book.id === bookId ? { ...book, status } : book));
  };


  const resetToMainView = () => {
    setSelectedBook(null);
    setError(null);
    setCurrentView(mainTab);
  };
  
  const switchMainTab = (tab: MainTab) => {
    setMainTab(tab);
    setCurrentView(tab);
    setSelectedBook(null);
    setError(null);
  };


  const isBookInLibrary = selectedBook ? library.some(b => b.id === selectedBook.id) : false;

  const renderMainContent = () => {
    if (currentView === 'details' && selectedBook) {
      return (
        <BookDetails
          book={selectedBook}
          onBack={resetToMainView}
          onAdd={handleAddToLibrary}
          onRemove={handleRemoveFromLibrary}
          isInLibrary={isBookInLibrary}
        />
      );
    }

    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6 border-b border-slate-300">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => switchMainTab('search')}
                    className={`${
                        mainTab === 'search'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base`}
                >
                    Find Book
                </button>
                <button
                    onClick={() => switchMainTab('collection')}
                    className={`${
                        mainTab === 'collection'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base`}
                >
                    My Library ({library.length})
                </button>
            </nav>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

        {mainTab === 'search' && (
             <div className="space-y-8">
                <BookSearch onSearch={handleSearch} isLoading={isLoading} />
                <div className="text-center text-slate-500">or</div>
                <Scanner onScan={handleSearch} currentView={currentView} setCurrentView={setCurrentView} />
            </div>
        )}
        {mainTab === 'collection' && (
            <LibraryCollection 
              books={library} 
              onUpdateStatus={handleUpdateBookStatus}
              onRemove={handleRemoveFromLibrary}
            />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main>
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;
