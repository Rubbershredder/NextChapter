package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"nextchapter.com/m/models"
)

// In-memory session store
var (
	sessions    = make(map[string]string) // maps sessionID to userID
	sessionLock sync.RWMutex
)

// SetSession stores a session ID with the associated user ID
func SetSession(sessionID, userID string) {
	sessionLock.Lock()
	defer sessionLock.Unlock()
	sessions[sessionID] = userID
}

// GetSession retrieves a user ID from a session ID
func GetSession(sessionID string) (string, bool) {
	sessionLock.RLock()
	defer sessionLock.RUnlock()
	userID, exists := sessions[sessionID]
	return userID, exists
}

// RemoveSession removes a session from the store
func RemoveSession(sessionID string) {
	sessionLock.Lock()
	defer sessionLock.Unlock()
	delete(sessions, sessionID)
}

// AuthRequired is a middleware that checks if the user is authenticated
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session from cookie
		sessionID, err := c.Cookie("session")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		// Check if session exists
		userID, exists := GetSession(sessionID)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			c.Abort()
			return
		}

		// Get user from session
		user, found := models.GetUserByID(userID)
		if !found {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", user)
		c.Next()
	}
}

// OwnerOnly is a middleware that ensures only book owners can access a route
func OwnerOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			c.Abort()
			return
		}

		userData := user.(models.User)
		if userData.Role != models.RoleOwner {
			c.JSON(http.StatusForbidden, gin.H{"error": "This action requires owner privileges"})
			c.Abort()
			return
		}

		c.Next()
	}
}
