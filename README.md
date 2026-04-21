# 🏦 Online Banking System

![Banking Dashboard](banking_app_hero_1776746028612.png)

A modern, full-stack online banking platform designed with a focus on security, performance, and a premium user experience. This project demonstrates a production-ready fintech architecture using Java Spring Boot for the backend and React for the frontend.

## 🚀 Features

- **🔐 Secure Authentication**: JWT-based authentication for secure user sessions.
- **📊 Interactive Dashboard**: Real-time overview of account balance and recent activities.
- **💸 Financial Operations**:
  - Deposit and Withdrawal functionality.
  - Seamless Peer-to-Peer (P2P) transfers.
- **📜 Transaction History**: Comprehensive log of all financial movements with detailed filtering.
- **🎨 Premium UI/UX**: High-fidelity dashboard design using Tailwind CSS and Lucide icons.
- **⚡ Performance First**: Built with Vite for lightning-fast frontend development and Spring Boot for a robust backend.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)

### Backend
- **Framework**: [Spring Boot 3.2.4](https://spring.io/projects/spring-boot)
- **Security**: [Spring Security](https://spring.io/projects/spring-security) (JWT)
- **Data Access**: [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- **Database**: [MySQL](https://www.mysql.com/)
- **Build Tool**: [Maven](https://maven.apache.org/)

## 🏗️ Architecture

The system follows a decoupled client-server architecture:
- **Backend**: A RESTful API built with Spring Boot, handling business logic, database interactions, and security.
- **Frontend**: A Modern SPA (Single Page Application) built with React, consuming the backend API.
- **Data Model**: Follows standard banking entities including `User`, `Account`, and `Transaction`.

Refer to [API_CONTRACT.md](API_CONTRACT.md) for detailed endpoint documentation.

## 🚥 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher
- **MySQL**: Running instance

### Backend Setup
1. Configure your MySQL database in `src/main/resources/application.properties` (or equivalent).
2. Build and run using Maven:
   ```bash
   mvn spring-boot:run
   ```
   The API will be available at `http://localhost:8082`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
