package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"nextchapter.com/m/models"
)

// GetAllBooks returns all book listings
func GetAllBooks(c *gin.Context) {
	// Optional query parameters for filtering
	title := c.Query("title")
	location := c.Query("location")
	genre := c.Query("genre")

	allBooks := models.GetAllBooks()
	filteredBooks := make([]models.Book, 0)

	// Apply filters if provided
	for _, book := range allBooks {
		// Match all provided filters
		titleMatch := title == "" || containsIgnoreCase(book.Title, title)
		locationMatch := location == "" || containsIgnoreCase(book.Location, location)
		genreMatch := genre == "" || containsIgnoreCase(book.Genre, genre)

		if titleMatch && locationMatch && genreMatch {
			filteredBooks = append(filteredBooks, book)
		}
	}

	c.JSON(http.StatusOK, filteredBooks)
}

// GetBookById returns a specific book by ID
func GetBookById(c *gin.Context) {
	bookID := c.Param("id")
	book, exists := models.GetBookByID(bookID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	c.JSON(http.StatusOK, book)
}

// CreateBook adds a new book listing
func CreateBook(c *gin.Context) {
	userID, userRole, exists := GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Only owners can create book listings
	if userRole != models.RoleOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only book owners can create listings"})
		return
	}

	var book models.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if book.Title == "" || book.Author == "" || book.Location == "" || book.ContactInfo == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title, author, location, and contact info are required"})
		return
	}

	// Set book properties
	book.ID = uuid.New().String()
	book.OwnerID = userID
	book.Status = "available" // Default status

	// Save the book
	if err := models.SaveBook(book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save book"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Book listing created successfully",
		"book":    book,
	})
}

// UpdateBook updates an existing book listing
func UpdateBook(c *gin.Context) {
	userID, userRole, exists := GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Only owners can update book listings
	if userRole != models.RoleOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only book owners can update listings"})
		return
	}

	bookID := c.Param("id")
	existingBook, exists := models.GetBookByID(bookID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	// Check if the user is the owner of the book
	if existingBook.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own book listings"})
		return
	}

	var updateData models.Book
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields while preserving ID and owner
	updateData.ID = bookID
	updateData.OwnerID = userID

	// Update the book
	if err := models.UpdateBook(updateData, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Book listing updated successfully",
		"book":    updateData,
	})
}

// DeleteBook removes a book listing
func DeleteBook(c *gin.Context) {
	userID, userRole, exists := GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Only owners can delete book listings
	if userRole != models.RoleOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only book owners can delete listings"})
		return
	}

	bookID := c.Param("id")

	// Try to delete the book
	if err := models.DeleteBook(bookID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Book listing deleted successfully",
	})
}

// Helper function for case-insensitive substring matching
func containsIgnoreCase(s, substr string) bool {
	s, substr = strings.ToLower(s), strings.ToLower(substr)
	return strings.Contains(s, substr)
}
