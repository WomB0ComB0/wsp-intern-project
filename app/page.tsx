"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
interface Book {
  id: string,
  selfLink: string,
  volumeInfo: {
    title: string | '' ,
    subtitle?: string | '',
    authors: string[] 
    imageLinks?: {
      thumbnail: string
    }
    previewLink?: string | ''
  }
}
async function getBooks(searchParams: string): Promise<Book[] | undefined>{
  if (searchParams === '') return undefined;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchParams}`)
  const data = await res.json()
  return data.items || [];
}
export default function Home() {
  const [searchField, setSearchField] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  useEffect(() => {
    const fetchBooks = async () => {
      const data = await getBooks(searchField);
      setBooks(data || []);
    };
    fetchBooks();
  }, [searchField]);
  useEffect(() => {
    const newFilteredBooks = books.filter((book) => {
      return book.volumeInfo.title.toLowerCase().includes(searchField.toLowerCase());
    });
    setFilteredBooks(newFilteredBooks);
  }, [searchField, books]);
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value || '');
  };
  return (
    <main className='flex flex-col items-center justify-center h-screen'>
      <section className='w-[90%] min-w-[425px] max-w-[1024px]'>
          <Search onSearchChange={onSearchChange} />
          <Container>
            {filteredBooks.length === 0 ? <NothingToShow /> : <BookList books={filteredBooks}/>}
          </Container>
      </section>
    </main>
  )
}
const Search = ({onSearchChange}: {onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) =>  void}) => {
  return(
    <>
      <form action="" autoComplete='off' className='flex flex-col items-center w-full mb-8'>
        <fieldset className='w-full mb-2 border-2 rounded-md border-grey p-[10px] flex pb-[15px] focus-within:border-indigo-500 bg-[#eee]'>
          <legend className='p-0 m-0'>Search terms*</legend>
          <input id='textInput' type="search" placeholder='Search books . . .' className='w-full bg-transparent h-18 focus:outline-none' onChange={onSearchChange}/>
        </fieldset>
      </form>
    </>
  )
}
const BookList = ({books}: {books:Book[]}) => {
  return (
    <div className=' h-[500px] scroll-smooth overflow-y-scroll scrollbar-none'>
      {books?.map((book) => (
        <Book key={book.id} book={book} />
      ))}
    </div>
  )
}
const Book = ({book}:{book: Book}) => {
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (text && text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };
  const books = book.volumeInfo;
  return(  
    <>
        <Link key={book.id} href={`${books.previewLink}`} className={`w-full h-[33%] flex flex-row items-center border-b-1 border-b-grey border px-[25px] justify-between text-[18px] bg-[#eee] hover:bg-indigo-500`} target='_blank' rel='noopener'>
          <p className='truncate '>{truncateText(books.title, 20)}</p>
          <p className='truncate'>{truncateText(books?.subtitle, 30)}</p> 
          <p className='truncate'>{truncateText(books.authors?.join(', '), 20)}</p> 
          <Image src={book.volumeInfo.imageLinks?.thumbnail || ''} alt={book.volumeInfo.title} width={100} height={100} className='object-cover'/>
        </Link>
    </>
  )
}
const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='w-full rounded-lg shadow-lg'>
      <hgroup className='border border-b-2 border-b-black h-[65px] flex flex-row w-full items-center px-9 justify-between rounded-t-lg text-lg font-[500] bg-[#ddd]'>
        <h4>Title</h4>
        <h4>Subtitle</h4>
        <h4>Author</h4>
        <h4>Thumbnail</h4>
      </hgroup>
      {children}
    </div>
  )
}
const NothingToShow = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full h-[100px]'>
      <h1 className='text-2xl text-grey'>Nothing to show . . .</h1>
    </div>
  )
}