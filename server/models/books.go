package models

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"os"
	"sync"
)

// Book represents a book listing
type Book struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Author      string `json:"author"`
	Genre       string `json:"genre"`
	Location    string `json:"location"`
	ContactInfo string `json:"contactInfo"` // Email or Phone
	OwnerID     string `json:"ownerId"`
	Status      string `json:"status"` // "available" or "rented"
	ImageURL    string `json:"imageUrl,omitempty"`
}

var (
	booksFilePath = "data/books.json"
	books         = make(map[string]Book)
	bookMutex     sync.RWMutex
)

// SaveBook saves a book to the data store
func SaveBook(book Book) error {
	bookMutex.Lock()
	defer bookMutex.Unlock()

	books[book.ID] = book
	return saveBooksToDisk()
}

// GetBookByID retrieves a book by ID
func GetBookByID(id string) (Book, bool) {
	bookMutex.RLock()
	defer bookMutex.RUnlock()

	book, exists := books[id]
	return book, exists
}

// GetAllBooks returns all books
func GetAllBooks() []Book {
	bookMutex.RLock()
	defer bookMutex.RUnlock()

	allBooks := make([]Book, 0, len(books))
	for _, book := range books {
		allBooks = append(allBooks, book)
	}
	return allBooks
}

// GetBooksByOwner returns all books for a specific owner
func GetBooksByOwner(ownerID string) []Book {
	bookMutex.RLock()
	defer bookMutex.RUnlock()

	ownerBooks := make([]Book, 0)
	for _, book := range books {
		if book.OwnerID == ownerID {
			ownerBooks = append(ownerBooks, book)
		}
	}
	return ownerBooks
}

// DeleteBook removes a book from the data store
func DeleteBook(id string, userID string) error {
	bookMutex.Lock()
	defer bookMutex.Unlock()

	book, exists := books[id]
	if !exists {
		return errors.New("book not found")
	}

	// Ensure the user is the owner of the book
	if book.OwnerID != userID {
		return errors.New("unauthorized: you can only delete your own books")
	}

	delete(books, id)
	return saveBooksToDisk()
}

// UpdateBook updates a book in the data store
func UpdateBook(book Book, userID string) error {
	bookMutex.Lock()
	defer bookMutex.Unlock()

	existingBook, exists := books[book.ID]
	if !exists {
		return errors.New("book not found")
	}

	// Ensure the user is the owner of the book
	if existingBook.OwnerID != userID {
		return errors.New("unauthorized: you can only update your own books")
	}

	books[book.ID] = book
	return saveBooksToDisk()
}

// saveBooksToDisk saves the books map to a JSON file
func saveBooksToDisk() error {
	data, err := json.MarshalIndent(books, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(booksFilePath, data, 0644)
}

// loadBooksFromDisk loads books from the JSON file
func loadBooksFromDisk() error {
	// Check if file exists
	if _, err := os.Stat(booksFilePath); os.IsNotExist(err) {
		// Create the file if it doesn't exist
		if err := saveBooksToDisk(); err != nil {
			return err
		}
		return nil
	}

	// Read the file
	data, err := ioutil.ReadFile(booksFilePath)
	if err != nil {
		return err
	}

	// If file is empty, return
	if len(data) == 0 {
		return nil
	}

	// Unmarshal the data
	return json.Unmarshal(data, &books)
}
