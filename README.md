# Pet Accessories Store

Welcome to the Pet Accessories Store project! This project is a full-stack web application designed to provide a seamless shopping experience for pet accessories. Below you will find an overview of the project structure, technologies used, and how to get started.

## Project Structure

The project is divided into two main parts: the frontend and the backend.

### Frontend

The frontend is built using React and Vite. It includes the following key directories and files:

- `public/`: Contains static files such as the favicon and the main HTML file.
- `src/`: Contains all the source code for the React application.
  - `assets/styles/`: Contains global styles and CSS variables.
  - `components/`: Contains reusable components for the application.
  - `pages/`: Contains page components that represent different views.
  - `services/`: Contains functions for API calls and authentication.
  - `store/`: Contains Redux slices for state management.
  - `App.jsx`: The main application component.
  - `main.jsx`: The entry point for the React application.

### Backend

The backend is built using Node.js and Express. It includes the following key directories and files:

- `controllers/`: Contains controller functions for handling requests.
- `models/`: Contains database models.
- `routes/`: Contains route definitions for the API.
- `config/`: Contains configuration files, including database connection settings.
- `middlewares/`: Contains middleware functions for authentication checks.
- `app.js`: Sets up the Express application.
- `server.js`: Starts the server.

## Technologies Used

- **Frontend**: React, Vite, Redux
- **Backend**: Node.js, Express, MongoDB (or any other database of your choice)
- **Styling**: CSS

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd pet-accessories-store
   ```

2. **Install dependencies**:
   - For the frontend:
     ```
     cd frontend
     npm install
     ```
   - For the backend:
     ```
     cd backend
     npm install
     ```

3. **Run the application**:
   - Start the backend server:
     ```
     cd backend
     node server.js
     ```
   - Start the frontend application:
     ```
     cd frontend
     npm run dev
     ```

4. **Visit the application**: Open your browser and go to `http://localhost:3000` (or the port specified in your Vite configuration).

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

Thank you for checking out the Pet Accessories Store project! We hope you enjoy building and using this application.