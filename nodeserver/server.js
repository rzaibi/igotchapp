const express = require('express');
const path = require('path'); 
const cookieParser = require('cookie-parser');
const bodyParser     =   require("body-parser");
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

let options = {
  maxAge: 1000 * 60 * 30, 
  httpOnly: false, 
  signed: false  
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
//----------------------------------------------------------------------
app.post('/rate', (req, res) => { 
   let params = req.body;
   var db = dbConnect(); 
   var gameID = JSON.parse(req.cookies.mygame).id; 
   db.get("select * from games where id = ?", [gameID], (err, row) => {     
    if (err) { 
      db.close();
      return res.json({'error':err.message});
    }
    if (!row){
       return res.json({'error': "Game with id "+gameID+" not found!"});
    }
    
    var userID = req.cookies.user.id;
    
    if (!userID){
      return res.json({'error': "Invalid user!"});
    }

    if (userID == 0){
      return res.json({'error': "Admins cannot rate games!"});
    }

    if ((params.rating < 1) || (params.rating > 5)){
      return res.json({'error': "Ratings should be between 1 and 5!"});
    }

    db.get("select * from feedback where user_id = ? and game_id = ?", [userID,  gameID], (err, row) => { 
        if (err) { 
          db.close();
          return res.json({'error':err.message});
        }
        if (row){          
          return res.json({'error':"User has already rated this game!"});
        }

        db.run("insert into feedback (user_id, game_id, rating, feedback) values (?,?,?,?)", 
        [userID,  gameID, params.rating, params.feedback], function(err){
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
app.get("/ratings", (req, res)=>{
  var db = dbConnect(); 
  var date1 = req.date1;
  var date2 = req.date2;
  var curDate = new Date();
  var weekEarlier = new Date();
   weekEarlier.setDate(weekEarlier.getDate() - 7);

  if (!date2){
    date2 = curDate.toISOString().substring(0,10).replace(/\-/,'').replace(/\-/,''); 
  }
  if (!date1){
    date1 = weekEarlier.toISOString().substring(0,10).replace(/\-/,'').replace(/\-/,''); 
  }
  var sql = "SELECT fd.avgFB, g.name, g.id FROM (SELECT round(AVG(f.rating),1) as avgFB, "+
  "f.game_id from feedback f where timestamp between ? and ? GROUP BY f.game_id) fd "+
  "LEFT JOIN games g ON g.id = fd.game_id"; 
  db.all(sql,[ date1,  date2],(err, rows ) => { 
    db.close(); 
    if (err) {
       return res.json({'error':err.message});
    }
    return res.json(rows);
  });
});
//-------------------------------------------------------------------
app.get("/games", (req, res)=>{
  var db = dbConnect(); 

  var sql = "SELECT g.*, g.id as gameID, f.id feedbackID, f.rating FROM games g  left join feedback f on f.game_id = g.id and f.user_id =  ?";
  db.all(sql,[req.cookies.user.id],(err, rows ) => {
     db.close();
      if (err) {
         return res.json({'error':err.message});
      }
      console.log(JSON.stringify(rows));
      return res.json(rows);
  });
});
 
//-------------------------------------------------------------------
app.get('/logout', (req, res) => {
  res.clearCookie('game').end(); 
  res.clearCookie('user').end();    
});
//-------------------------------------------------------------------
app.get('/getRatings', (req, res) => { 
     res.json(getRatings(req));
});
//----------------------------------------------------------------------
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

//----------------------------------------------------------------------

app
  .use(express.static(path.join(__dirname, '../build')))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
   
app.get('/*', (req, res) => { 
      res.sendFile(path.join(__dirname, '../build/index.html'));
});

