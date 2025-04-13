package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"nextchapter.com/m/models"
)

// CreateBook handles the creation of a new book listing
func CreateBook(c *gin.Context) {
	// Get the current user from the context (set by auth middleware)
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	user := userObj.(models.User)

	// Only owners can create book listings
	if user.Role != models.RoleOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only book owners can create listings"})
		return
	}

	// Bind the book data from request
	var book models.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate ID for the book
	id, err := generateID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate ID"})
		return
	}
	book.ID = id

	// Set the owner ID
	book.OwnerID = user.ID

	// Set initial status if not provided
	if book.Status == "" {
		book.Status = "available"
	}

	// Save the book
	if err := models.SaveBook(book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save book"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Book created successfully", "book": book})
}

// GetAllBooks returns all available books
func GetAllBooks(c *gin.Context) {
	books := models.GetAllBooks()
	c.JSON(http.StatusOK, gin.H{"books": books})
}

// GetBook returns a specific book by ID
func GetBook(c *gin.Context) {
	id := c.Param("id")
	book, exists := models.GetBookByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"book": book})
}

// UpdateBook updates a book listing
func UpdateBook(c *gin.Context) {
	// Get the current user from the context
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	user := userObj.(models.User)

	// Get book ID from URL
	id := c.Param("id")

	// Check if book exists
	existingBook, exists := models.GetBookByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	// Check if user is the owner
	if existingBook.OwnerID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own books"})
		return
	}

	// Bind updated book data
	var updatedBook models.Book
	if err := c.ShouldBindJSON(&updatedBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Keep the same ID and owner
	updatedBook.ID = id
	updatedBook.OwnerID = user.ID

	// Update the book
	if err := models.UpdateBook(updatedBook, user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Book updated successfully", "book": updatedBook})
}

// DeleteBook removes a book listing
func DeleteBook(c *gin.Context) {
	// Get the current user from the context
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	user := userObj.(models.User)

	// Get book ID from URL
	id := c.Param("id")

	// Delete the book
	if err := models.DeleteBook(id, user.ID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Book deleted successfully"})
}

// GetMyBooks returns all books belonging to the current user
func GetMyBooks(c *gin.Context) {
	// Get the current user from the context
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	user := userObj.(models.User)

	// Get the user's books
	books := models.GetBooksByOwner(user.ID)
	c.JSON(http.StatusOK, gin.H{"books": books})
}

// UpdateBookStatus updates just the status of a book
func UpdateBookStatus(c *gin.Context) {
	// Get the current user from the context
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	user := userObj.(models.User)

	// Get book ID from URL
	id := c.Param("id")

	// Check if book exists
	existingBook, exists := models.GetBookByID(id)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	// Check if user is the owner
	if existingBook.OwnerID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own books"})
		return
	}

	// Bind status data
	var statusData struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&statusData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update only the status
	existingBook.Status = statusData.Status
	if err := models.UpdateBook(existingBook, user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Book status updated successfully", "book": existingBook})
}

// SearchBooks searches for books by title, author, or location
func SearchBooks(c *gin.Context) {
	query := c.Query("q")
	location := c.Query("location")
	genre := c.Query("genre")

	if query == "" && location == "" && genre == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one search parameter is required"})
		return
	}

	allBooks := models.GetAllBooks()
	filteredBooks := []models.Book{}

	for _, book := range allBooks {
		// Check if book matches search criteria
		matchesQuery := query == "" || containsIgnoreCase(book.Title, query) || containsIgnoreCase(book.Author, query)
		matchesLocation := location == "" || containsIgnoreCase(book.Location, location)
		matchesGenre := genre == "" || containsIgnoreCase(book.Genre, genre)

		if matchesQuery && matchesLocation && matchesGenre {
			filteredBooks = append(filteredBooks, book)
		}
	}

	c.JSON(http.StatusOK, gin.H{"books": filteredBooks})
}

// Helper function to check if a string contains another string (case insensitive)
func containsIgnoreCase(s, substr string) bool {
	s, substr = strings.ToLower(s), strings.ToLower(substr)
	return strings.Contains(s, substr)
}

// generateID generates a random ID for books
func generateID() (string, error) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
