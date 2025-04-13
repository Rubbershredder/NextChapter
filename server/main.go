package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"nextchapter.com/m/handlers"
	"nextchapter.com/m/middleware"
	"nextchapter.com/m/models"
)

func main() {
	// Initialize the router
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization, Accept, Origin"},
		AllowCredentials: true,
	}))

	// set up the routes
	SetupRoutes(router)

	// Start the server
	log.Println("Server started on http://localhost:8080")
	if err := router.Run(":8000"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func SetupRoutes(router *gin.Engine) {
	// Initialize data store
	models.InitializeDataStore()

	// Public routes
	router.POST("/api/register", handlers.RegisterUserWithID)
	router.POST("/api/login", handlers.Login)
	router.GET("/api/books", handlers.GetAllBooks)
	router.GET("/api/books/:id", handlers.GetBook)
	router.GET("/api/search", handlers.SearchBooks)

	// Routes that require authentication
	authenticated := router.Group("/api")
	authenticated.Use(middleware.AuthRequired())
	{
		// Auth routes
		authenticated.GET("/me", handlers.GetCurrentUser)
		authenticated.POST("/logout", handlers.Logout)
		authenticated.PUT("/me", handlers.UpdateUser)

		// Book routes
		authenticated.POST("/books", handlers.CreateBook)
		authenticated.GET("/my-books", handlers.GetMyBooks)         // Existing route
		authenticated.GET("/books/owned", handlers.GetOwnedBooks)   // New route for owners
		authenticated.GET("/rented-books", handlers.GetRentedBooks) // New route for seekers
		authenticated.PUT("/books/:id", handlers.UpdateBook)
		authenticated.POST("/books/:id/request", handlers.RequestBook)
		authenticated.DELETE("/books/:id", handlers.DeleteBook)
		authenticated.PATCH("/books/:id/status", handlers.UpdateBookStatus)

		// User profile routes
		authenticated.GET("/users/:id", handlers.GetUserProfile)
	}

	// Owner-only routes
	ownerOnly := router.Group("/api/admin")
	ownerOnly.Use(middleware.AuthRequired(), middleware.OwnerOnly())
	{
		ownerOnly.GET("/users", handlers.ListUsers)
	}
}
