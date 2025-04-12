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

	// Set up CORS to allow requests from the frontend
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Initialize data store
	models.InitializeDataStore()

	// Set up routes
	setupRoutes(router)

	// Start the server
	log.Println("Server starting on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(router *gin.Engine) {
	// Auth routes
	router.POST("/api/register", handlers.RegisterUser)
	router.POST("/api/login", handlers.LoginUser)

	// User routes
	userRoutes := router.Group("/api/users")
	userRoutes.Use(middleware.BasicAuth())
	{
		userRoutes.GET("/profile", handlers.GetUserProfile)
		userRoutes.PUT("/profile", handlers.UpdateUserProfile)
	}

	// Book routes
	bookRoutes := router.Group("/api/books")
	{
		bookRoutes.GET("", handlers.GetAllBooks)     // Public route - no auth needed
		bookRoutes.GET("/:id", handlers.GetBookById) // Public route - no auth needed

		// Protected routes that require authentication
		authBooks := bookRoutes.Group("")
		authBooks.Use(middleware.BasicAuth())
		{
			// Owner only routes
			ownerBooks := authBooks.Group("")
			ownerBooks.Use(middleware.RequireOwner())
			{
				ownerBooks.POST("", handlers.CreateBook)
				ownerBooks.PUT("/:id", handlers.UpdateBook)
				ownerBooks.DELETE("/:id", handlers.DeleteBook)
			}
		}
	}
}
