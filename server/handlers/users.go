package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"nextchapter.com/m/models"
)

// GetUserProfile returns the current user's profile
func GetUserProfile(c *gin.Context) {
	userID, _, exists := GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, exists := models.GetUserByID(userID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Don't send the password back
	c.JSON(http.StatusOK, gin.H{
		"id":           user.ID,
		"name":         user.Name,
		"email":        user.Email,
		"mobileNumber": user.MobileNumber,
		"role":         user.Role,
	})
}

// UpdateUserProfile updates the current user's profile
func UpdateUserProfile(c *gin.Context) {
	userID, _, exists := GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var updateData struct {
		Name         string `json:"name"`
		MobileNumber string `json:"mobileNumber"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get current user data
	user, exists := models.GetUserByID(userID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update fields
	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	if updateData.MobileNumber != "" {
		user.MobileNumber = updateData.MobileNumber
	}

	// Save updated user
	if err := models.SaveUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":           user.ID,
			"name":         user.Name,
			"email":        user.Email,
			"mobileNumber": user.MobileNumber,
			"role":         user.Role,
		},
	})
}
