const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body; // Extract username and password from request body

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists in the users array
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username, password });

  // Return success message
  return res.status(201).json({ message: "User successfully registered" });
});

//  --------------------- GET all books (Promises w/callback) ---------------------
public_users.get("/", function (req, res) {
 
  // Wrapping the logic in a Promise
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books); // Resolve with the books data if it exists
    } else {
      reject("Books data not found"); // Reject if books data is missing
    }
  })
    .then((data) => {
      // On successful fetch, send the books data
      res.status(200).send(JSON.stringify({ books: data }, null, 4));
    })
    .catch((error) => {
      // log the error and send an error response
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Error retrieving books.", error });
    });
});

//  --------------------- GET books by ISBN (Promises w/callback) ---------------------
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Extract ISBN from the route parameter
  
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found for the given ISBN.");
    }
  })
    .then((book) => {
      // Handle the resolved case (book found)
      res.status(200).json(book);
    })
    .catch((error) => {
      console.error(`Error fetching books by isbn: ${isbn}.`, error);
      res.status(404).json({ message: error });
    });
});

//  --------------------- GET books by author (Promises w/callback) ---------------------
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.replace(/\s+/g, "").toLowerCase(); // Extract and normalize the author name
 
  new Promise((resolve, reject) => {
    const booksByAuthor = [];

    // loop through the books object to find the books by "Author"
    for (const isbn in books) {
      const bookAuthor = books[isbn].author.replace(/\s+/g, "").toLowerCase();
      if (bookAuthor.includes(author)) {
        booksByAuthor.push({ isbn, ...books[isbn] });
      }
    }

    // use Resolve if books were found, else use Reject
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject(`No books found by the author: ${author}`);
    }
  })
    .then((booksByAuthor) => {
      // Handle the success case
      res.status(200).json(booksByAuthor);
    })
    .catch((error) => {
      // Handle the error case
      console.error(`Error fetching books by isbn: ${author}.`, error);
      res.status(404).json({ message: error });
    });
});

//  --------------------- GET books by title (Promises w/callback) ---------------------
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.replace(/\s+/g, "").toLowerCase(); // Normalize the title input

  new Promise((resolve, reject) => {
    const booksWithTitle = [];

    // loop through the books object to find books by matching titles
    for (const isbn in books) {
      const bookTitle = books[isbn].title.replace(/\s+/g, "").toLowerCase();
      if (bookTitle.includes(title)) {
        booksWithTitle.push({ isbn, ...books[isbn] });
      }
    }

    // Resolve or reject based on whether matching books are found
    if (booksWithTitle.length > 0) {      
      resolve(booksWithTitle);
    } else {   
      reject(`No books found with the title: ${title}`);
    }
  })
    .then((booksWithTitle) => {
      // Handle the resolved case     
      res.status(200).json(booksWithTitle);
    })
    .catch((error) => {
      // Handle the rejected case
      res.status(404).json({ message: error });
    });
});


//  --------------------- GET books by Review based on ISBN (Local Function) ---------------------
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Extract ISBN from the route parameter

  //check if isbn exist in books object
  if (books[isbn]) {
    // If the book exists, return the reviews
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    
    return res
      .status(404)
      .json({ message: `No reviews found for the book with ISBN: ${isbn}` });
  }
});

module.exports.general = public_users;
