package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"nextchapter.com/m/models"
)

// RegisterUser handles user registration
func RegisterUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if user.Name == "" || user.Email == "" || user.Password == "" || user.MobileNumber == "" || user.Role == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	// Validate role
	if user.Role != models.RoleOwner && user.Role != models.RoleSeeker {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role must be either 'owner' or 'seeker'"})
		return
	}

	// Check if user already exists by email
	if _, exists := models.GetUserByEmail(user.Email); exists {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Generate a unique ID
	user.ID = uuid.New().String()

	// Save the user
	if err := models.SaveUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"userId":  user.ID,
	})
}

// LoginUser handles user login
func LoginUser(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		log.Printf("Login error: Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt: Email=%s", credentials.Email)

	// Find the user by email
	user, exists := models.GetUserByEmail(credentials.Email)
	if !exists {
		log.Printf("Login failed: User with email %s not found", credentials.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	log.Printf("Found user: %s, verifying password", user.Email)

	// Check password
	if user.Password != credentials.Password {
		log.Printf("Login failed: Password mismatch for user %s", user.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	log.Printf("Login successful for user: %s (Role: %s)", user.Email, user.Role)

	// Set user info in session/cookie
	c.Set("userID", user.ID)
	c.Set("userRole", user.Role)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// GetUserFromContext retrieves user info from the context
func GetUserFromContext(c *gin.Context) (string, string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", "", false
	}

	userRole, exists := c.Get("userRole")
	if !exists {
		return "", "", false
	}

	return userID.(string), userRole.(string), true
}
