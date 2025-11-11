import { Book } from '../types';

const API_URL = 'https://openlibrary.org/api/books';

interface OpenLibraryBook {
  title: string;
  subtitle?: string;
  authors?: { name: string }[];
  publishers?: { name: string }[];
  publish_date?: string;
  subjects?: { name: string }[];
  number_of_pages?: number;
  cover?: {
    medium?: string;
    large?: string;
  };
  identifiers?: {
    isbn_10?: string[];
    isbn_13?: string[];
  };
}

const transformToBook = (isbn: string, olBook: OpenLibraryBook): Book => {
  const foundIsbn = olBook.identifiers?.isbn_13?.[0] || olBook.identifiers?.isbn_10?.[0] || isbn;

  return {
    id: olBook.title + foundIsbn, // Create a unique ID
    title: olBook.title + (olBook.subtitle ? `: ${olBook.subtitle}` : ''),
    authors: olBook.authors?.map(a => a.name) || ['Unknown Author'],
    publisher: olBook.publishers?.[0]?.name,
    publishedDate: olBook.publish_date,
    description: 'A detailed description for this book is not available from this data source.',
    categories: olBook.subjects?.map(s => s.name).slice(0, 3),
    pageCount: olBook.number_of_pages,
    imageLinks: {
      thumbnail: olBook.cover?.large || olBook.cover?.medium,
      smallThumbnail: olBook.cover?.medium,
    },
    isbn: foundIsbn,
    status: 'available',
  };
};

export const fetchBookByISBN = async (isbn: string): Promise<Book> => {
  if (!isbn) {
    throw new Error('ISBN is required.');
  }
  
  const cleanIsbn = isbn.trim().replace(/-/g, '');
  const url = `${API_URL}?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch book data from the Open Library API.');
  }

  const data = await response.json();
  const bookData = data[`ISBN:${cleanIsbn}`];

  if (!bookData) {
    throw new Error(`Book with ISBN ${cleanIsbn} not found.`);
  }

  return transformToBook(cleanIsbn, bookData);
};
