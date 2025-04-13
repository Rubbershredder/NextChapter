package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"nextchapter.com/m/models"
)

// UpdateUser updates a user's profile information
func UpdateUser(c *gin.Context) {
	// Get the current user from the context
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	currentUser := userObj.(models.User)

	// Bind updated user data
	var updatedUser models.User
	if err := c.ShouldBindJSON(&updatedUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Keep the same ID and role (these cannot be changed)
	updatedUser.ID = currentUser.ID
	updatedUser.Role = currentUser.Role

	// If password is empty, keep the current password
	if updatedUser.Password == "" {
		updatedUser.Password = currentUser.Password
	}

	// Check if the email is being changed and if it already exists
	if updatedUser.Email != currentUser.Email {
		if _, found := models.GetUserByEmail(updatedUser.Email); found {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already in use"})
			return
		}
	}

	// Save the updated user
	if err := models.SaveUser(updatedUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Don't return the password in the response
	updatedUser.Password = ""
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": updatedUser})
}

// GetUserProfile gets public profile information for a user
func GetUserProfile(c *gin.Context) {
	userID := c.Param("id")
	user, exists := models.GetUserByID(userID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Create a public profile with limited information
	publicProfile := struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Role        string `json:"role"`
		ContactInfo string `json:"contactInfo"`
	}{
		ID:          user.ID,
		Name:        user.Name,
		Role:        user.Role,
		ContactInfo: user.Email, // Use email as contact info
	}

	c.JSON(http.StatusOK, gin.H{"user": publicProfile})
}

// RegisterUserWithID handles user registration with ID generation
func RegisterUserWithID(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	_, found := models.GetUserByEmail(user.Email)
	if found {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	// Generate ID for the user
	id, err := generateID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate ID"})
		return
	}
	user.ID = id

	// Validate role
	if user.Role != models.RoleOwner && user.Role != models.RoleSeeker {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role. Must be either 'owner' or 'seeker'"})
		return
	}

	// Save the user
	err = models.SaveUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
		return
	}

	// Don't return the password in the response
	user.Password = ""
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user": user})
}

// ListUsers returns a list of all users (admin only)
func ListUsers(c *gin.Context) {
	// Get the current user from the context
	userObj, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	currentUser := userObj.(models.User)

	// Check if user is an owner (for admin purposes)
	if currentUser.Role != models.RoleOwner {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only owners can view all users"})
		return
	}

	// Get all users
	allUsers := []models.User{}
	for _, user := range models.Users {
		// Don't expose passwords
		user.Password = ""
		allUsers = append(allUsers, user)
	}

	c.JSON(http.StatusOK, gin.H{"users": allUsers})
}
