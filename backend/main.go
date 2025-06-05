package main

import (
	"fmt"
	"log"
	"net/http"
	"path"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var jwtSecret = []byte("secret_key_autosalon_2023")

// Модель пользователя для авторизации
type User struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Username     string     `json:"username" gorm:"unique"`
	Password     string     `json:"password,omitempty" gorm:"-"`
	PasswordHash string     `json:"-" gorm:"column:password"`
	Email        string     `json:"email"`
	FullName     string     `json:"fullName"`
	IsAdmin      bool       `json:"isAdmin"`
	LastLogin    *time.Time `json:"lastLogin"`
	CreatedAt    time.Time  `json:"createdAt"`
}

// Структура для авторизации
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Структура для регистрации нового пользователя
type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"fullName" binding:"required"`
}

// Структура для JWT-токена
type JWTClaims struct {
	Username string `json:"username"`
	IsAdmin  bool   `json:"isAdmin"`
	jwt.RegisteredClaims
}

// генерация JWT
func generateToken(user User) (string, error) {
	claims := JWTClaims{
		Username: user.Username,
		IsAdmin:  user.IsAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// мидлварь для авторизации
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Отсутствует токен авторизации"})
			c.Abort()
			return
		}

		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Недействительный токен"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
			c.Set("username", claims.Username)
			c.Set("isAdmin", claims.IsAdmin)
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Недействительный токен"})
			c.Abort()
			return
		}
	}
}

// мидлварь проверки на админа
func adminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isAdmin, exists := c.Get("isAdmin")
		if !exists || isAdmin != true {
			c.JSON(http.StatusForbidden, gin.H{"error": "Требуются права администратора"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// Модель автосалона
type Shop struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Address     string `json:"address"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Description string `json:"description"`
}

// Модель марки
type CarBrand struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

// Модель модели
type CarModel struct {
	ID      uint     `json:"id" gorm:"primaryKey"`
	BrandID uint     `json:"brandId"`
	Name    string   `json:"name"`
	Brand   CarBrand `json:"brand" gorm:"foreignKey:BrandID"`
}

// Модель автомобиля
type Car struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	BrandID      uint      `json:"brandId"`
	ModelID      uint      `json:"modelId"`
	Year         int       `json:"year"`
	EnginePower  int       `json:"enginePower"`
	Transmission string    `json:"transmission"`
	Condition    string    `json:"condition"`
	Mileage      int       `json:"mileage"`
	Color        string    `json:"color"`
	VIN          string    `json:"vin" gorm:"-"`
	Price        int       `json:"price"`
	ShopID       uint      `json:"shopId"`
	InStock      bool      `json:"inStock"`
	ArrivalDate  time.Time `json:"arrivalDate"`
	ImagePath    string    `json:"imagePath"`

	Brand CarBrand `json:"brand" gorm:"foreignKey:BrandID"`
	Model CarModel `json:"model" gorm:"foreignKey:ModelID"`
	Shop  Shop     `json:"shop" gorm:"foreignKey:ShopID"`
}

// Модель клиента
type Customer struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	FullName       string     `json:"fullName"`
	Phone          string     `json:"phone"`
	Email          string     `json:"email"`
	Address        string     `json:"address"`
	PreferredBrand string     `json:"preferredBrand"`
	PreferredModel string     `json:"preferredModel"`
	YearFrom       int        `json:"yearFrom"`
	YearTo         int        `json:"yearTo"`
	Condition      string     `json:"condition"`
	MaxPrice       int        `json:"maxPrice"`
	LastContact    *time.Time `json:"lastContact"`
	Notes          string     `json:"notes"`
	Status         string     `json:"status"`
}

// Модель сотрудника
type Employee struct {
	ID       uint      `json:"id" gorm:"primaryKey"`
	ShopID   uint      `json:"shopId"`
	FullName string    `json:"fullName"`
	Position string    `json:"position"`
	Phone    string    `json:"phone"`
	Email    string    `json:"email"`
	HireDate time.Time `json:"hireDate"`
	Salary   int       `json:"salary"`

	Shop Shop `json:"shop" gorm:"foreignKey:ShopID"`
}

// Модель продажи
type Sale struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CarID       uint      `json:"carId"`
	CustomerID  uint      `json:"customerId"`
	ShopID      uint      `json:"shopId"`
	SaleDate    time.Time `json:"saleDate"`
	SalePrice   int       `json:"salePrice"`
	PaymentType string    `json:"paymentType"`
	EmployeeID  uint      `json:"employeeId"`

	Car      Car      `json:"car" gorm:"foreignKey:CarID"`
	Customer Customer `json:"customer" gorm:"foreignKey:CustomerID"`
	Shop     Shop     `json:"shop" gorm:"foreignKey:ShopID"`
	Employee Employee `json:"employee" gorm:"foreignKey:EmployeeID"`
}

// Модель варианта финансирования
type FinanceOption struct {
	ID             uint    `json:"id" gorm:"primaryKey"`
	Name           string  `json:"name"`
	MinDownPayment float64 `json:"minDownPayment"`
	MaxTerm        int     `json:"maxTerm"`
	InterestRate   float64 `json:"interestRate"`
	Description    string  `json:"description"`
}

// Модель расчета стоимости
type CostCalculation struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	CarID           uint      `json:"carId"`
	CustomerID      uint      `json:"customerId"`
	FinanceOptionID uint      `json:"financeOptionId"`
	DownPayment     int       `json:"downPayment"`
	LoanTerm        int       `json:"loanTerm"`
	InsuranceCost   int       `json:"insuranceCost"`
	TradeInValue    int       `json:"tradeInValue"`
	CreatedAt       time.Time `json:"createdAt"`

	Car           Car           `json:"car" gorm:"foreignKey:CarID"`
	Customer      Customer      `json:"customer" gorm:"foreignKey:CustomerID"`
	FinanceOption FinanceOption `json:"financeOption" gorm:"foreignKey:FinanceOptionID"`
}

// Модель для избранных авто юзера
type Favorite struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"userId"`
	CarID     uint      `json:"carId"`
	CreatedAt time.Time `json:"createdAt"`

	User User `json:"user" gorm:"foreignKey:UserID"`
	Car  Car  `json:"car" gorm:"foreignKey:CarID"`
}

// обработка загрузки файлов
func handleFileUpload(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл не получен"})
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	filepath := path.Join("uploads/cars", filename)

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"filepath": filepath,
		"filename": filename,
	})
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.POST("/api/upload", handleFileUpload)

	r.Static("/uploads", "./uploads")

	db, err := gorm.Open(sqlite.Open("cars.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Ошибка подключения к базе данных:", err)
	}

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	db.AutoMigrate(&Shop{}, &CarBrand{}, &CarModel{}, &Car{}, &Customer{},
		&Employee{}, &Sale{}, &FinanceOption{}, &CostCalculation{}, &User{}, &Favorite{})

	if err := createDefaultAdmin(db); err != nil {
		log.Println("Ошибка создания администратора:", err)
	}

	// авторизация
	r.POST("/api/auth/login", func(c *gin.Context) {
		var loginReq LoginRequest
		if err := c.ShouldBindJSON(&loginReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user User
		result := db.Where("username = ?", loginReq.Username).First(&user)
		if result.Error != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверное имя пользователя или пароль"})
			return
		}

		err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(loginReq.Password))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверное имя пользователя или пароль"})
			return
		}

		token, err := generateToken(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания токена"})
			return
		}

		now := time.Now()
		user.LastLogin = &now
		db.Save(&user)

		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"isAdmin":  user.IsAdmin,
				"fullName": user.FullName,
				"email":    user.Email,
			},
		})
	})

	// регистрация
	r.POST("/api/auth/register", func(c *gin.Context) {
		var registerReq RegisterRequest
		if err := c.ShouldBindJSON(&registerReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var existingUser User
		result := db.Where("username = ?", registerReq.Username).First(&existingUser)
		if result.Error == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Пользователь с таким именем уже существует"})
			return
		}

		result = db.Where("email = ?", registerReq.Email).First(&existingUser)
		if result.Error == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Пользователь с таким email уже существует"})
			return
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке пароля"})
			return
		}

		newUser := User{
			Username:     registerReq.Username,
			PasswordHash: string(passwordHash),
			Email:        registerReq.Email,
			FullName:     registerReq.FullName,
			IsAdmin:      false,
			CreatedAt:    time.Now(),
		}

		if err := db.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании пользователя"})
			return
		}

		token, err := generateToken(newUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания токена"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"token": token,
			"user": gin.H{
				"id":       newUser.ID,
				"username": newUser.Username,
				"isAdmin":  newUser.IsAdmin,
				"fullName": newUser.FullName,
				"email":    newUser.Email,
			},
			"message": "Регистрация прошла успешно",
		})
	})

	// проверка токена
	r.GET("/api/auth/check", authMiddleware(), func(c *gin.Context) {
		username, _ := c.Get("username")
		c.JSON(http.StatusOK, gin.H{
			"status":   "authorized",
			"username": username,
		})
	})

	SetupCalculatorRoutes(r)

	// маршруты админки
	adminRoutes := r.Group("/api/admin")
	adminRoutes.Use(authMiddleware(), adminMiddleware())
	{

		// CRUD автомобиля
		adminRoutes.POST("/cars", func(c *gin.Context) {
			var car Car
			if err := c.ShouldBindJSON(&car); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&car)
			c.JSON(http.StatusCreated, car)
		})

		adminRoutes.PUT("/cars/:id", func(c *gin.Context) {
			var car Car
			id := c.Param("id")
			db.First(&car, id)
			if car.ID == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Автомобиль не найден"})
				return
			}
			if err := c.ShouldBindJSON(&car); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Save(&car)
			c.JSON(http.StatusOK, car)
		})

		adminRoutes.DELETE("/cars/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&Car{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Автомобиль удален"})
		})

		// создание автосалона
		adminRoutes.POST("/shops", func(c *gin.Context) {
			var shop Shop
			if err := c.ShouldBindJSON(&shop); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&shop)
			c.JSON(http.StatusCreated, shop)
		})

		// создание марки
		adminRoutes.POST("/brands", func(c *gin.Context) {
			var brand CarBrand
			if err := c.ShouldBindJSON(&brand); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&brand)
			c.JSON(http.StatusCreated, brand)
		})

		// создание модели
		adminRoutes.POST("/models", func(c *gin.Context) {
			var model CarModel
			if err := c.ShouldBindJSON(&model); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&model)
			c.JSON(http.StatusCreated, model)
		})

		// CRUD клиента
		adminRoutes.POST("/customers", func(c *gin.Context) {
			var customer Customer
			if err := c.ShouldBindJSON(&customer); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&customer)
			c.JSON(http.StatusCreated, customer)
		})

		adminRoutes.PUT("/customers/:id", func(c *gin.Context) {
			var customer Customer
			id := c.Param("id")
			db.First(&customer, id)
			if customer.ID == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Клиент не найден"})
				return
			}
			if err := c.ShouldBindJSON(&customer); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Save(&customer)
			c.JSON(http.StatusOK, customer)
		})

		adminRoutes.DELETE("/customers/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&Customer{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Клиент удален"})
		})

		// CRUD сотрудника
		adminRoutes.POST("/employees", func(c *gin.Context) {
			var employee Employee
			if err := c.ShouldBindJSON(&employee); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&employee)
			c.JSON(http.StatusCreated, employee)
		})

		adminRoutes.PUT("/employees/:id", func(c *gin.Context) {
			var employee Employee
			id := c.Param("id")
			db.First(&employee, id)
			if employee.ID == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Сотрудник не найден"})
				return
			}
			if err := c.ShouldBindJSON(&employee); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Save(&employee)
			c.JSON(http.StatusOK, employee)
		})

		adminRoutes.DELETE("/employees/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&Employee{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Сотрудник удален"})
		})

		// добавление продажи
		adminRoutes.POST("/sales", func(c *gin.Context) {
			var sale Sale
			if err := c.ShouldBindJSON(&sale); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if sale.SaleDate.IsZero() {
				sale.SaleDate = time.Now()
			}
			db.Create(&sale)
			db.Model(&Car{}).Where("id = ?", sale.CarID).Update("in_stock", false)
			c.JSON(http.StatusCreated, sale)
		})
	}

	// работа с избранными автомобилями
	userRoutes := r.Group("/api/user")
	userRoutes.Use(authMiddleware())
	{
		// получение избранных автомобилей
		userRoutes.GET("/favorites", func(c *gin.Context) {
			username, _ := c.Get("username")
			var user User
			db.Where("username = ?", username).First(&user)
			var favorites []Favorite
			db.Where("user_id = ?", user.ID).Find(&favorites)

			var result []Car = []Car{}
			for _, fav := range favorites {
				var car Car
				db.Preload("Shop").Preload("Brand").Preload("Model").Where("id = ?", fav.CarID).First(&car)
				result = append(result, car)
			}
			c.JSON(http.StatusOK, result)
		})

		// CRUD избранных автомобилей
		userRoutes.POST("/favorites/:carId", func(c *gin.Context) {
			username, _ := c.Get("username")
			carID := c.Param("carId")
			var user User
			result := db.Where("username = ?", username).First(&user)
			if result.Error != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
				return
			}

			var car Car
			result = db.First(&car, carID)
			if result.Error != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Автомобиль не найден"})
				return
			}

			var existingFavorite Favorite
			result = db.Where("user_id = ? AND car_id = ?", user.ID, carID).First(&existingFavorite)
			if result.Error == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Автомобиль уже добавлен в избранное"})
				return
			}

			favorite := Favorite{
				UserID:    user.ID,
				CarID:     car.ID,
				CreatedAt: time.Now(),
			}
			db.Create(&favorite)
			c.JSON(http.StatusCreated, gin.H{"message": "Автомобиль добавлен в избранное"})
		})

		userRoutes.DELETE("/favorites/:carId", func(c *gin.Context) {
			username, _ := c.Get("username")
			carID := c.Param("carId")

			var user User
			result := db.Where("username = ?", username).First(&user)
			if result.Error != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
				return
			}

			result = db.Where("user_id = ? AND car_id = ?", user.ID, carID).Delete(&Favorite{})
			if result.RowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Автомобиль не найден в избранном"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Автомобиль удален из избранного"})
		})

		userRoutes.GET("/favorites/:carId", func(c *gin.Context) {
			username, _ := c.Get("username")
			carID := c.Param("carId")

			var user User
			result := db.Where("username = ?", username).First(&user)
			if result.Error != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
				return
			}

			var favorite Favorite
			result = db.Where("user_id = ? AND car_id = ?", user.ID, carID).First(&favorite)
			if result.Error != nil {
				c.JSON(http.StatusOK, gin.H{"isFavorite": false})
				return
			}
			c.JSON(http.StatusOK, gin.H{"isFavorite": true})
		})
	}

	// Дальше эндпоинты доступные без авторизации

	// список всех автомобилей
	r.GET("/api/cars", func(c *gin.Context) {
		var cars []Car
		db.Preload("Shop").Preload("Brand").Preload("Model").Where("in_stock = ?", true).Find(&cars)
		c.JSON(http.StatusOK, cars)
	})

	// информация об автомобиле
	r.GET("/api/cars/:id", func(c *gin.Context) {
		var car Car
		id := c.Param("id")
		db.Preload("Shop").Preload("Brand").Preload("Model").First(&car, id)
		c.JSON(http.StatusOK, car)
	})

	// список всех автосалонов
	r.GET("/api/shops", func(c *gin.Context) {
		var shops []Shop
		db.Find(&shops)
		c.JSON(http.StatusOK, shops)
	})

	// список всех марок
	r.GET("/api/brands", func(c *gin.Context) {
		var brands []CarBrand
		db.Find(&brands)
		c.JSON(http.StatusOK, brands)
	})

	// список всех моделей
	r.GET("/api/models", func(c *gin.Context) {
		var models []CarModel
		db.Preload("Brand").Find(&models)
		c.JSON(http.StatusOK, models)
	})

	// список моделей определенного бренда
	r.GET("/api/brands/:brandId/models", func(c *gin.Context) {
		brandId := c.Param("brandId")
		var models []CarModel
		db.Where("brand_id = ?", brandId).Find(&models)
		c.JSON(http.StatusOK, models)
	})

	// список всех клиентов
	r.GET("/api/customers", func(c *gin.Context) {
		var customers []Customer
		db.Find(&customers)
		c.JSON(http.StatusOK, customers)
	})

	// получение покупателя по ID
	r.GET("/api/customers/:id", func(c *gin.Context) {
		id := c.Param("id")
		var customer Customer
		result := db.First(&customer, id)
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Покупатель не найден"})
			return
		}
		c.JSON(http.StatusOK, customer)
	})

	// список всех сотрудников
	r.GET("/api/employees", func(c *gin.Context) {
		var employees []Employee
		db.Preload("Shop").Find(&employees)
		c.JSON(http.StatusOK, employees)
	})

	// список всех продаж
	r.GET("/api/sales", func(c *gin.Context) {
		var sales []Sale
		db.Preload("Car.Brand").Preload("Car.Model").Preload("Customer").Preload("Shop").Preload("Employee").Order("sale_date DESC").Find(&sales)
		c.JSON(http.StatusOK, sales)
	})

	// список вариантов финансирования
	r.GET("/api/finance-options", func(c *gin.Context) {
		var options []FinanceOption
		db.Find(&options)
		c.JSON(http.StatusOK, options)
	})

	// автомобили с низким пробегом
	r.GET("/api/cars/low-mileage", func(c *gin.Context) {
		var cars []Car
		db.Preload("Shop").Preload("Brand").Preload("Model").
			Where("condition = 'used' AND mileage < 30000 AND in_stock = ?", true).Find(&cars)
		c.JSON(http.StatusOK, cars)
	})

	// новые автомобили
	r.GET("/api/cars/new", func(c *gin.Context) {
		var cars []Car
		db.Preload("Shop").Preload("Brand").Preload("Model").
			Where("condition = 'new' AND in_stock = ?", true).Find(&cars)
		c.JSON(http.StatusOK, cars)
	})

	// самый дорогой автомобиль
	r.GET("/api/cars/most-expensive", func(c *gin.Context) {
		var car Car
		db.Preload("Shop").Preload("Brand").Preload("Model").
			Order("price desc").First(&car)
		c.JSON(http.StatusOK, car)
	})

	// подбор клиентов для автомобиля
	r.GET("/api/customers/match-car/:carId", func(c *gin.Context) {
		carID := c.Param("carId")
		var car Car
		db.Preload("Brand").Preload("Model").First(&car, carID)
		if car.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Автомобиль не найден"})
			return
		}

		var matchingCustomers []Customer
		query := db.Where("max_price >= ?", car.Price)

		if car.Brand.Name != "" {
			query = query.Where("preferred_brand = ? OR preferred_brand = ''", car.Brand.Name)
		}

		if car.Model.Name != "" {
			query = query.Where("preferred_model = ? OR preferred_model = ''", car.Model.Name)
		}

		if car.Year > 0 {
			query = query.Where("(year_from <= ? OR year_from = 0) AND (year_to >= ? OR year_to = 0)", car.Year, car.Year)
		}

		if car.Condition != "" {
			query = query.Where("condition = ? OR condition = '' OR condition = 'any'", car.Condition)
		}

		query.Find(&matchingCustomers)
		c.JSON(http.StatusOK, matchingCustomers)
	})

	// статистика продаж по автосалонам
	r.GET("/api/stats/shop-sales", func(c *gin.Context) {
		var result []struct {
			ShopID       uint   `json:"shopId"`
			ShopName     string `json:"shopName"`
			SalesCount   int    `json:"salesCount"`
			TotalRevenue int    `json:"totalRevenue"`
		}

		db.Table("sales").
			Select("sales.shop_id, shops.name as shop_name, COUNT(*) as sales_count, SUM(sales.sale_price) as total_revenue").
			Joins("JOIN shops ON shops.id = sales.shop_id").
			Group("sales.shop_id").
			Scan(&result)

		c.JSON(http.StatusOK, result)
	})

	// анализ рынка
	r.GET("/api/market/ratio", func(c *gin.Context) {
		var totalBudget int64
		var totalCarPrice int64
		db.Model(&Customer{}).Select("coalesce(sum(max_price), 0)").Row().Scan(&totalBudget)
		db.Model(&Car{}).Where("in_stock = ?", true).Select("coalesce(sum(price), 0)").Row().Scan(&totalCarPrice)
		c.JSON(http.StatusOK, gin.H{
			"totalCustomerBudget": totalBudget,
			"totalCarPrice":       totalCarPrice,
			"ratio":               float64(totalBudget) / float64(totalCarPrice),
		})
	})

	r.Run(":8080")
}

// создание базового админа
func createDefaultAdmin(db *gorm.DB) error {
	var adminCount int64
	db.Model(&User{}).Where("is_admin = ?", true).Count(&adminCount)
	if adminCount == 0 {
		passwordHash, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		admin := User{
			Username:     "admin",
			PasswordHash: string(passwordHash),
			IsAdmin:      true,
			CreatedAt:    time.Now(),
		}
		result := db.Create(&admin)
		return result.Error
	}
	return nil
}
