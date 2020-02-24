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
app
  .use(express.static(path.join(__dirname, '../build')))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const PORT = process.env.PORT || 6000;

let options = {
  maxAge: 1000 * 60 * 30, //30 minutes session
  httpOnly: false,  //accessible by ReactJS
  signed: true  
}
//--------------------------------------------------------
app.get('/login', (req, res) => {
  var user = req.body;
  if (user.username === 'admin') {
    if (user.password != '!Gotchapp1Admin2')
      return res.json({});

    user = {'username':'admin', 'id':0, 'name':'Administrator'}
    res.cookie('user', user, options);
    return res.json({'username':'admin'});
  }     

  res.cookie('user', {'username':user.username, 'id':user.id, 'name':user.name}, options);
});
//--------------------------------------------------------
app.get('/logout', (req, res) => {
  res.clearCookie('user').end();
});
//-------------------------------------------------------------------
function rategame(params){
  return true;
}
//-------------------------------------------------------------------
function getRatings(params){
  return true;
}
//--------------------------------------------------------------------------------------
app.get('/*', (req, res) => {  
    res.sendFile(path.join(__dirname, '../build/index.html'));
});
//--------------------------------------------------------------------------------------
function dbConnect (){
  let db = new sqlite3.Database('../db/igotchapp.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the igotchapp database.');
  });

  return db;
} 