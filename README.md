# Library Management System

## A web app that provides functionality for managing books, authors and borrowers along with tracking borrow and return dates for borrowed books. 

The app supports Role-Based Access Control with four distinct roles: 

1. Admin
2. Librarian
3. Receptionist
4. Reader

## Features

* Book Management: Add, update, and remove books from the library.
* Author Management: Add, update, and remove authors.
* Borrower Management: Track borrowed books, manage borrow/return dates, and view borrower details.
* Role-Based Access Control:
    1. Admin: Full access to all operations (manages users, books, authors, and borrowed books).
    2. Librarian: Full access to all operations, except managing users.
    3. Receptionist: Manage borrowed books information (borrow/return books).
    4. Reader: View their borrowed books and available books in the library.

## Tech Stack

* NodeJS
* Express JS
* PostgreSQL
* JWT
* Passport JS ( middleware for authenticating requests )
* Bcrypt ( to hash and store passwords )
* JOI ( to validate user inputs )

### Installation

* Clone the repository: git clone https://github.com/PreethiKalyani99/library-mgmt-app-backend.git

* Install dependencies: npm install

* Refer to the .env.example file to set up the necessary environment variables.

### Usage

npm start