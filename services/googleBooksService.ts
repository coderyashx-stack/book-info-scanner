
import { Book, GoogleBookItem, GoogleBooksVolumeInfo } from '../types';

const API_URL = 'https://www.googleapis.com/books/v1/volumes';

const transformToBook = (item: GoogleBookItem): Book => {
  const volumeInfo = item.volumeInfo;
  const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier || 'N/A';
  
  return {
    id: item.id,
    title: volumeInfo.title + (volumeInfo.subtitle ? `: ${volumeInfo.subtitle}` : ''),
    authors: volumeInfo.authors || ['Unknown Author'],
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    categories: volumeInfo.categories,
    pageCount: volumeInfo.pageCount,
    imageLinks: volumeInfo.imageLinks,
    isbn: isbn,
    status: 'available',
  };
};

export const fetchBookByISBN = async (isbn: string): Promise<Book> => {
  if (!isbn) {
    throw new Error('ISBN is required.');
  }

  const response = await fetch(`${API_URL}?q=isbn:${isbn.trim()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch book data from Google Books API.');
  }

  const data = await response.json();

  if (data.totalItems === 0 || !data.items) {
    throw new Error(`Book with ISBN ${isbn} not found.`);
  }

  return transformToBook(data.items[0]);
};
