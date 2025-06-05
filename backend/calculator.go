package main

import (
	"net/http"
	"time"

	"math"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// расчет импорта автомобиля
type ImportCalculation struct {
	CarPrice        float64 `json:"carPrice"`
	CarYear         int     `json:"carYear"`
	EngineVolume    float64 `json:"engineVolume"`
	EnginePower     int     `json:"enginePower"`
	Country         string  `json:"country"`
	CustomsFee      float64 `json:"customsFee"`
	ExciseTax       float64 `json:"exciseTax"`
	VAT             float64 `json:"vat"`
	UtilizationFee  float64 `json:"utilizationFee"`
	RegistrationFee float64 `json:"registrationFee"`
	TotalCost       float64 `json:"totalCost"`
}

// ежемесячный платеж
type MonthlyPaymentRequest struct {
	CarID           uint `json:"carId"`
	CustomerID      uint `json:"customerId"`
	FinanceOptionID uint `json:"financeOptionId"`
	DownPayment     int  `json:"downPayment"`
	LoanTerm        int  `json:"loanTerm"`
	HasInsurance    bool `json:"hasInsurance"`
	TradeInValue    int  `json:"tradeInValue"`
}

type MonthlyPaymentResponse struct {
	MonthlyLoanPayment  float64 `json:"monthlyLoanPayment"`
	InsuranceCost       float64 `json:"insuranceCost"`
	TotalMonthlyPayment float64 `json:"totalMonthlyPayment"`
	TotalCost           float64 `json:"totalCost"`
	CalculationID       uint    `json:"calculationId"`
}

// общая стоимость владения
type TotalCostRequest struct {
	CarID         uint `json:"carId"`
	LoanTerm      int  `json:"loanTerm"`
	YearlyMileage int  `json:"yearlyMileage"`
}

type TotalCostResponse struct {
	InitialPrice     int     `json:"initialPrice"`
	FuelCost         float64 `json:"fuelCost"`
	ServiceCost      float64 `json:"serviceCost"`
	TaxCost          float64 `json:"taxCost"`
	InsuranceCost    float64 `json:"insuranceCost"`
	TotalCost        float64 `json:"totalCost"`
	YearsOfOwnership float64 `json:"yearsOfOwnership"`
}

func SetupCalculatorRoutes(r *gin.Engine) {

	// расчет стоимости импорта
	r.POST("/api/calculator/import", calculateImportCost)

	// ежемесячный платеж
	r.POST("/api/calculator/monthly-payment", func(c *gin.Context) {
		var req MonthlyPaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var car Car
		var financeOption FinanceOption
		db, ok := c.MustGet("db").(*gorm.DB)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "База данных недоступна"})
			return
		}
		if err := db.First(&car, req.CarID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Автомобиль не найден"})
			return
		}
		if err := db.First(&financeOption, req.FinanceOptionID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Вариант финансирования не найден"})
			return
		}
		loanAmount := car.Price - req.DownPayment - req.TradeInValue
		monthlyInterestRate := financeOption.InterestRate / 100 / 12

		var monthlyPayment float64
		if monthlyInterestRate > 0 {
			monthlyPayment = float64(loanAmount) * monthlyInterestRate *
				(math.Pow(1+monthlyInterestRate, float64(req.LoanTerm))) /
				(math.Pow(1+monthlyInterestRate, float64(req.LoanTerm)) - 1)
		} else {
			monthlyPayment = float64(loanAmount) / float64(req.LoanTerm)
		}

		var insuranceCost float64 = 0
		if req.HasInsurance {
			insuranceCost = float64(car.Price) * 0.05 / 12
		}

		totalMonthlyPayment := monthlyPayment + insuranceCost
		calculation := CostCalculation{
			CarID:           req.CarID,
			CustomerID:      req.CustomerID,
			FinanceOptionID: req.FinanceOptionID,
			DownPayment:     req.DownPayment,
			LoanTerm:        req.LoanTerm,
			InsuranceCost:   int(insuranceCost * float64(req.LoanTerm)),
			TradeInValue:    req.TradeInValue,
			CreatedAt:       time.Now(),
		}
		db.Create(&calculation)
		c.JSON(http.StatusOK, MonthlyPaymentResponse{
			MonthlyLoanPayment:  monthlyPayment,
			InsuranceCost:       insuranceCost,
			TotalMonthlyPayment: totalMonthlyPayment,
			TotalCost:           totalMonthlyPayment * float64(req.LoanTerm),
			CalculationID:       calculation.ID,
		})
	})

	// общая стоимость владения
	r.POST("/api/calculator/total-cost", func(c *gin.Context) {
		var req TotalCostRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		var car Car
		db, ok := c.MustGet("db").(*gorm.DB)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "База данных недоступна"})
			return
		}
		if err := db.First(&car, req.CarID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Автомобиль не найден"})
			return
		}
		years := float64(req.LoanTerm) / 12
		fuelConsumptionPer100km := 8.0
		fuelCostPerLiter := 50.0
		yearlyFuelCost := fuelConsumptionPer100km / 100 * float64(req.YearlyMileage) * fuelCostPerLiter

		var yearlyServiceCost float64
		if car.BrandID <= 5 {
			yearlyServiceCost = float64(car.Price) * 0.05
		} else {
			yearlyServiceCost = float64(car.Price) * 0.03
		}

		taxPerYear := float64(car.EnginePower) * 10
		insurancePerYear := float64(car.Price) * 0.05
		totalOwnershipCost := float64(car.Price) +
			(yearlyFuelCost+yearlyServiceCost+taxPerYear+insurancePerYear)*years

		c.JSON(http.StatusOK, TotalCostResponse{
			InitialPrice:     int(car.Price),
			FuelCost:         yearlyFuelCost * years,
			ServiceCost:      yearlyServiceCost * years,
			TaxCost:          taxPerYear * years,
			InsuranceCost:    insurancePerYear * years,
			TotalCost:        totalOwnershipCost,
			YearsOfOwnership: years,
		})
	})
}

// расчет стоимости импорта автомобиля
func calculateImportCost(c *gin.Context) {
	var calc ImportCalculation
	if err := c.ShouldBindJSON(&calc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	calc.CustomsFee = calculateCustomsFee(calc.CarPrice, calc.CarYear, calc.Country)
	calc.ExciseTax = calculateExciseTax(calc.EngineVolume, calc.CarYear)
	calc.VAT = calculateVAT(calc.CarPrice + calc.CustomsFee + calc.ExciseTax)
	calc.UtilizationFee = calculateUtilizationFee(calc.CarYear)
	calc.RegistrationFee = calculateRegistrationFee(calc.EnginePower)
	calc.TotalCost = calc.CarPrice + calc.CustomsFee + calc.ExciseTax + calc.VAT +
		calc.UtilizationFee + calc.RegistrationFee
	c.JSON(http.StatusOK, calc)
}

// расчет таможенной пошлины
func calculateCustomsFee(carPrice float64, carYear int, country string) float64 {
	age := time.Now().Year() - carYear
	var rate float64
	switch {
	case country == "ЕС" && age <= 3:
		rate = 0.15
	case country == "ЕС" && age <= 5:
		rate = 0.20
	case country == "ЕС" && age <= 7:
		rate = 0.25
	case country == "ЕС":
		rate = 0.30
	case country == "США" && age <= 3:
		rate = 0.18
	case country == "США" && age <= 5:
		rate = 0.23
	case country == "США" && age <= 7:
		rate = 0.28
	case country == "США":
		rate = 0.33
	default:
		rate = 0.25
	}
	return carPrice * rate
}

// расчет акцизного сбора
func calculateExciseTax(engineVolume float64, carYear int) float64 {
	age := time.Now().Year() - carYear
	var rate float64
	switch {
	case engineVolume <= 1.0:
		rate = 3000
	case engineVolume <= 1.5:
		rate = 5000
	case engineVolume <= 2.0:
		rate = 7000
	case engineVolume <= 3.0:
		rate = 9000
	default:
		rate = 12000
	}
	ageCoefficient := 1.0
	if age > 5 {
		ageCoefficient = 1.5
	}
	if age > 10 {
		ageCoefficient = 2.0
	}

	return rate * ageCoefficient
}

// расчет НДС
func calculateVAT(baseSum float64) float64 {
	return baseSum * 0.20
}

// расчет утиля
func calculateUtilizationFee(carYear int) float64 {
	age := time.Now().Year() - carYear
	if age <= 3 {
		return 3000
	} else if age <= 7 {
		return 5000
	}
	return 8000
}

// расчет регистрационного сбора
func calculateRegistrationFee(enginePower int) float64 {
	switch {
	case enginePower <= 100:
		return 2000
	case enginePower <= 150:
		return 3000
	case enginePower <= 200:
		return 5000
	case enginePower <= 250:
		return 7500
	default:
		return 10000
	}
}
