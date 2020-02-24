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
//----------------------------------------------------------------------
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
       return res.json(rows);
  });
});
 
//-------------------------------------------------------------------
app.get('/logout', (req, res) => {
  res.clearCookie('game').end(); 
  res.clearCookie('user').end();    
});
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