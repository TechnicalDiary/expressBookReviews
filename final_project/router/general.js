const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


function getBooks() {
  return new Promise((resolve, reject) => {
    try {
      const books = require('./booksdb.js'); // Load books
      resolve(books);
    } catch (error) {
      reject('Error loading books: ' + error.message);
    }
  });
}


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
        // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async  (req, res) => {
    try {
        const books = await getBooks();
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

})


// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn  = req.params.isbn;
    
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data[isbn]);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
const authorName = req.params.author; // Get author from request params
    const bookKeys = Object.keys(books); // Get all keys from books object
    let matchingBooks = [];

    // Iterate through all books and check if author matches
    bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
        matchingBooks.push(books[key]);
        }
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json({ books: matchingBooks });
    } else {
        return res.status(404).json({ message: "No books found for the given author" });
    }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
 
    const titleName = req.params.title; // Get title from request params
    const bookKeys = Object.keys(books); // Get all keys from books object
    let matchingBooks = [];

    // Iterate through all books and check if title matches
    bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === titleName.toLowerCase()) {
        matchingBooks.push(books[key]);
        }
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json({ books: matchingBooks });
    } else {
        return res.status(404).json({ message: "No books found for the given title" });
    }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Get ISBN from request params

    // Check if the book exists
    if (books[isbn]) {
        const reviews = books[isbn].reviews; // Get reviews for the book
        return res.status(200).json({ reviews: reviews });
    } else {
        return res.status(404).json({ message: "Book not found for the given ISBN" });
    }

});

module.exports.general = public_users;
