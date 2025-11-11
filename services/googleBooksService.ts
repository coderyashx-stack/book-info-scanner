import { Book, GoogleBookItem } from '../types';

const OPEN_LIBRARY_API_URL = 'https://openlibrary.org';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';


// --- Open Library Interfaces & Transformers ---

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

interface OpenLibrarySearchResultDoc {
  title: string;
  author_name?: string[];
  publisher?: string[];
  publish_date?: string[];
  isbn?: string[];
  cover_i?: number;
}

const transformDetailedToBook = (isbn: string, olBook: OpenLibraryBook): Book => {
  const foundIsbn = olBook.identifiers?.isbn_13?.[0] || olBook.identifiers?.isbn_10?.[0] || isbn;
  return {
    id: `ol-${foundIsbn}`,
    title: olBook.title + (olBook.subtitle ? `: ${olBook.subtitle}` : ''),
    authors: olBook.authors?.map(a => a.name) || ['Unknown Author'],
    publisher: olBook.publishers?.[0]?.name,
    publishedDate: olBook.publish_date,
    description: 'A detailed description for this book is not available from this data source.',
    categories: olBook.subjects?.map(s => s.name).slice(0, 3),
    pageCount: olBook.number_of_pages,
    imageLinks: {
      thumbnail: olBook.cover?.large || olBook.cover?.medium,
    },
    isbn: foundIsbn,
    status: 'available',
  };
};

const transformSearchToBook = (doc: OpenLibrarySearchResultDoc): Book => {
    const isbn = doc.isbn?.find(i => i.length === 13 || i.length === 10) || 'N/A';
    return {
      id: `ol-${isbn}`,
      title: doc.title,
      authors: doc.author_name || ['Unknown Author'],
      publisher: doc.publisher?.[0],
      publishedDate: doc.publish_date?.[0],
      description: 'Basic information was found for this book using a fallback search.',
      categories: [],
      pageCount: undefined,
      imageLinks: doc.cover_i ? {
        thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
      } : undefined,
      isbn: isbn,
      status: 'available',
    };
  };

// --- Google Books Transformer ---

const transformGoogleBookToBook = (item: GoogleBookItem): Book => {
    const isbn13 = item.volumeInfo.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier;
    const isbn10 = item.volumeInfo.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier;
    const isbn = isbn13 || isbn10 || 'N/A';

    return {
        id: `gb-${item.id}`,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        publisher: item.volumeInfo.publisher,
        publishedDate: item.volumeInfo.publishedDate,
        description: item.volumeInfo.description,
        categories: item.volumeInfo.categories,
        pageCount: item.volumeInfo.pageCount,
        imageLinks: item.volumeInfo.imageLinks ? {
          thumbnail: item.volumeInfo.imageLinks.thumbnail,
          smallThumbnail: item.volumeInfo.imageLinks.smallThumbnail,
        } : undefined,
        isbn: isbn,
        status: 'available',
    };
};


export const fetchBookByISBN = async (isbn: string): Promise<Book> => {
  if (!isbn) {
    throw new Error('ISBN is required.');
  }
  
  const cleanIsbn = isbn.trim().replace(/-/g, '');
  
  // --- Primary Method: Open Library Detailed API ---
  const detailedUrl = `${OPEN_LIBRARY_API_URL}/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
  try {
    const response = await fetch(detailedUrl);
    if (response.ok) {
      const data = await response.json();
      const bookData = data[`ISBN:${cleanIsbn}`];
      if (bookData && Object.keys(bookData).length > 0) {
        return transformDetailedToBook(cleanIsbn, bookData);
      }
    }
  } catch (error) {
    console.warn(`Open Library (Detailed) fetch failed for ISBN ${cleanIsbn}.`, error);
  }

  // --- Fallback Method: Open Library Search API ---
  const searchUrl = `${OPEN_LIBRARY_API_URL}/search.json?q=${cleanIsbn}`;
  try {
    const searchResponse = await fetch(searchUrl);
    if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.docs && searchData.docs.length > 0) {
            return transformSearchToBook(searchData.docs[0]);
        }
    }
  } catch (error) {
    console.warn(`Open Library (Search) fetch failed for ISBN ${cleanIsbn}.`, error);
  }

  // --- Secondary Fallback Method: Google Books API ---
  try {
    // Note: A Google API Key is required for reliable use. 
    // This is assumed to be in the environment variables.
    const googleBooksUrl = `${GOOGLE_BOOKS_API_URL}?q=isbn:${cleanIsbn}&key=${process.env.API_KEY}`;
    const googleResponse = await fetch(googleBooksUrl);
    if (googleResponse.ok) {
      const googleData = await googleResponse.json();
      if (googleData.totalItems > 0 && googleData.items[0]) {
        return transformGoogleBookToBook(googleData.items[0]);
      }
    }
  } catch (error) {
    console.warn(`Google Books fetch failed for ISBN ${cleanIsbn}.`, error);
  }


  // --- If all methods fail ---
  console.log(`Unresolved ISBN: ${cleanIsbn}`);
  throw new Error("Book not found. This ISBN may belong to a new or regional edition not yet listed in public databases.");
};