package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"nextchapter.com/m/models"
)

// BasicAuth middleware for simple email/password auth
func BasicAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		email, password, hasAuth := c.Request.BasicAuth()
		if !hasAuth {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			return
		}

		user, exists := models.GetUserByID(email)
		if !exists || user.Password != password {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Store user information in the context
		c.Set("userID", user.ID)
		c.Set("userRole", user.Role)
		c.Next()
	}
}

// RequireOwner middleware ensures the user is an owner
func RequireOwner() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists || userRole != models.RoleOwner {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Owner access required"})
			return
		}
		c.Next()
	}
}

// RequireSeeker middleware ensures the user is a seeker
func RequireSeeker() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists || userRole != models.RoleSeeker {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Seeker access required"})
			return
		}
		c.Next()
	}
}
