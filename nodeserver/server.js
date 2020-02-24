const express = require('express');
const path = require('path'); 
const cookieParser = require('cookie-parser');
const bodyParser     =   require("body-parser");
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(cookieParser('12e3e538a0105aabc61f3854e3e515ad'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 6000;

let options = {
  maxAge: 1000 * 60 * 30, 
  httpOnly: false,  
  signed: true  
}

function dbConnect (){
  let db = new sqlite3.Database('../db/igotchapp.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the igotchapp database.');
  });

  return db;
} 