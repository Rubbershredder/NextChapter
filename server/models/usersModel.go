package models

import (
	"encoding/json"
	"os"
	"sync"
)

// main roles required
const (
	RoleOwner  = "owner"
	RoleSeeker = "seeker"
)

var Users = make(map[string]User)

// we initialise the user structure here
type User struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	MobileNumber string `json:"mobileNumber"`
	Role         string `json:"role"`
}

// we wull initialize the data dirctory file path here
var (
	userFilePath = "data/users.json"
	users        = make(map[string]User) // used to map the user ID to the user
	userMutex    sync.RWMutex            // used to protect the users map
)

// SaveUser saves a user to the data store
func SaveUser(user User) error {
	userMutex.Lock()
	defer userMutex.Unlock()

	users[user.ID] = user
	return saveUsersToDisk() //this function is called to save the user
}

// GetUserByID looks up a user by ID
func GetUserByID(id string) (User, bool) {
	userMutex.RLock() // used to protect the users map
	defer userMutex.RUnlock()

	user, exists := users[id]
	return user, exists
}

// GetUserByEmail looks up a user by email instead of ID
func GetUserByEmail(email string) (User, bool) {
	userMutex.RLock()
	defer userMutex.RUnlock()

	for _, user := range users {
		if user.Email == email {
			return user, true
		}
	}
	return User{}, false
}
func saveUsersToDisk() error {
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(userFilePath, data, 0644)
}

func loadUsersFromDisk() error {
	if _, err := os.Stat(userFilePath); os.IsNotExist(err) {
		// Create the file if it doesn't exist
		if err := saveUsersToDisk(); err != nil {
			return err
		}
		return nil
	}
	// Read the file
	data, err := os.ReadFile(userFilePath)
	if err != nil {
		return err
	}
	// If file is empty, return
	if len(data) == 0 {
		return nil
	}
	// Unmarshal the data
	return json.Unmarshal(data, &users)
}
