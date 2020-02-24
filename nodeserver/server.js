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
app.post('/login', (req, res) => { 
  let user = req.body;
  
  if (user.username === 'admin') {
    if (user.password != 'admin')
      return res.json({});

      user = {'username':'admin', 'id':0, 'name':'Administrator'}

      res.cookie('user',user, options);
     return res.json({'username':'admin'});
  }     

  var db = dbConnect();
  var sql = "SELECT id, username, name from users where username = ? and password = ? limit 1";
  
  db.get(sql, [user.username, user.password], (err, row) => {     
    if (err) { 
      db.close();
      return res.json({});
    }
    if (row){
      sql = "update users set last_login = (strftime('%Y%m%d%H%M%S',datetime('now','localtime'))) where id = ?";
      db.run(sql, [row.id],function(err){
        db.close();
        
        if (err){
          console.log("User login update failed, user id = "+row.id);
        }
      }); 
    }else{
      db.close();
    }

    user = {'username': row.username, 'id': row.id, 'name':row.name};
    res.cookie('user', user, options);
    return res.json(user);
  }); 
});
//--------------------------------------------------------
app.get('/logout', (req, res) => {
  res.clearCookie('user').end();
});
//--------------------------------------------------------
app.post('/rate', (req, res) => { 
  let params = req.body;
  var db = dbConnect(); 
   db.get("select * from games where id = ?", [params.gameID], (err, row) => {     
    if (err) { 
      db.close();
      return res.json({'error':err.message});
    }
    if (!row){
       return res.json({'error': "Game with id"+params.gameID+"not found!"});
    }
    
    var userID = req.signedCookies.user.id;
    
    if (!userID){
      return res.json({'error': "Invalid user!"});
    }

    if (userID == 0){
      return res.json({'error': "Admins cannot rate games!"});
    }

    if ((params.rating < 1) || (params.rating > 5)){
      return res.json({'error': "Ratings should be between 1 and 5!"});
    }

    db.get("select * from feedback where user_id = ? and game_id = ?", [userID, params.gameID], (err, row) => { 
        if (err) { 
          db.close();
          return res.json({'error':err.message});
        }
        if (row){          
          return res.json({'error':"User has already rated this game!"});
        }

        db.run("insert into feedback (user_id, game_id, rating, feedback) values (?,?,?,?)", 
        [userID, params.gameID, params.rating, params.feedback], function(err){
           db.close();
           if (err) {
             return res.json({'error':err.message});
           }
            return res.json({'success':"Rating suceeded! Thanks for your interest!"});

        });
    });
  });
});   
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