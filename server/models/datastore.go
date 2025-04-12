package models

import (
	"log"
	"os"
)

// InitializeDataStore sets up the data storage
func InitializeDataStore() {
	// Create data directory if it doesn't exist
	if _, err := os.Stat("data"); os.IsNotExist(err) {
		err := os.Mkdir("data", 0755)
		if err != nil {
			log.Fatalf("Failed to create data directory: %v", err)
		}
	}

	// Load users from disk
	if err := loadUsersFromDisk(); err != nil {
		log.Printf("Error loading users: %v", err)
	}

	// Load books from disk
	if err := loadBooksFromDisk(); err != nil {
		log.Printf("Error loading books: %v", err)
	}

	log.Println("Data store initialized successfully")
}
