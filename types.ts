
export interface Book {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  categories?: string[];
  pageCount?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  isbn: string;
  status: 'available' | 'checked_out';
}

export interface GoogleBooksVolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}
