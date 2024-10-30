'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Book {
  id: string
  selfLink: string
  volumeInfo: {
    title: string
    subtitle?: string
    authors?: string[]
    imageLinks?: {
      thumbnail: string
    }
    previewLink?: string
  }
}

export default function Component() {
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBooks([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Failed to fetch books')
      
      const data = await res.json()
      setBooks(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBooks(searchQuery)
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, fetchBooks])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search for books..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : books.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No books found' : 'Start typing to search for books'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead className="hidden md:table-cell">Subtitle</TableHead>
                    <TableHead>Author(s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="h-16 w-12 relative">
                          <Image
                            src={book.volumeInfo.imageLinks?.thumbnail || '/placeholder.svg'}
                            alt={book.volumeInfo.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link 
                          href={book.volumeInfo.previewLink || '#'} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {book.volumeInfo.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {book.volumeInfo.subtitle || '-'}
                      </TableCell>
                      <TableCell>
                        {book.volumeInfo.authors?.join(', ') || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
