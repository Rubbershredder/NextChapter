package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"

	"github.com/gin-gonic/gin"
	"nextchapter.com/m/middleware"
	"nextchapter.com/m/models"
)

// RegisterUser handles user registration
func RegisterUser(c *gin.Context) {
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

	// Save the user (without hashing the password)
	err := models.SaveUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
		return
	}

	// Don't return the password in the response
	user.Password = ""
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user": user})
}

// Login handles user login
func Login(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find the user
	user, found := models.GetUserByEmail(credentials.Email)
	if !found {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare passwords directly (no hashing)
	if user.Password != credentials.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate session ID
	sessionID, err := generateSessionID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Store session using the middleware function
	middleware.SetSession(sessionID, user.ID)

	// Return session cookie
	c.SetCookie("session", sessionID, 3600*24, "/", "", false, true)

	// Don't return the password in the response
	user.Password = ""
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": user})
}

// Logout handles user logout
func Logout(c *gin.Context) {
	sessionID, err := c.Cookie("session")
	if err == nil {
		middleware.RemoveSession(sessionID)
	}
	c.SetCookie("session", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser returns the current logged in user
func GetCurrentUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	userData := user.(models.User)
	userData.Password = "" // Don't return the password

	c.JSON(http.StatusOK, gin.H{"user": userData})
}

// generateSessionID generates a random session ID
func generateSessionID() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
