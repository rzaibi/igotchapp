import React from 'react';  
import Header from './Header';
import cookie from 'react-cookies'; 
import axios from 'axios';
import $ from 'jquery';


class Home extends React.Component {
  constructor(props) {
    super(props);
    var gamecookie = cookie.load('mygame', { path: '/' });
    gamecookie = gamecookie? gamecookie:{'name':'', 'id':''};
    this.state = {feedback:'', rating: '', data:[], game:gamecookie, games:[]};
  }
  //----------------------------------------------------------------------
   onChange = (e) => { 
    this.setState({ [e.target.name]: e.target.value });
  }
  //-----------------------------------------------------------------------
  rateForm = async (e) =>{
     e.preventDefault();

     try {
      let res = await axios.post('/rate', {'rating': this.state.rating, 'feedback': this.state.feedback});         
      if (res.data.error){
        return alert(res.data.error);  
      }
      alert(res.data.success);
      cookie.remove('mygame', { path: '/' });
      window.location.reload();  
    } catch (e) {
      alert("System error occurred: "+e.message);
    }
  }
   //-----------------------------------------------------------------------
   rateGame = (e) =>{
    e.preventDefault();

    try {
       var i =  e.target.name.substring(1);
       var game = this.state.data[i];
       cookie.save('mygame',  game, { path: '/' });
       window.location.reload();
   } catch (e) {
     alert("System error occurred: "+e.message);
   }
 } 
 //-----------------------------------
 backToGames(){
    cookie.remove('mygame', { path: '/' });
    window.location.reload();
 }
//-------------------------------------------------------------
  dashboard(){
      let userCookie =  JSON.parse(cookie.load('user').substring(2));
       
      if (userCookie.username == 'admin'){
        if (this.state.games.length == 0)
        axios.get('/ratings', {})
        .then(res => this.setState({ games: res.data }))
         .catch();       
      return  (<div id='gameListHolder'><h2>All game ratings for the last week</h2>
          <table>
            <thead><tr><td>Game ID</td><td>Game Name</td><td>Rating</td></tr></thead>
            <tbody>
          {this.state.games.map((item, i) => {            
            return (
              <tr key={i}> 
                <td>{item.id}</td><td>{item.name}</td><td>{item.avgFB}</td>
              </tr>
            );
            })}    
            </tbody></table></div>); 
       
      
      }

      if (!cookie.load('mygame')){
        if (this.state.data.length == 0)
        axios.get('/games', {})
        .then(res => this.setState({ data: res.data }))
         .catch();       
      return  (<div id='gameListHolder'><h2>List of games to rate</h2>
          <ul>
          {this.state.data.map((item, i) => {
            let formName = "f"+i;
            if (!item.feedbackID)
            return (
              <li key={i}>
              <form onSubmit={this.rateGame} name={formName}>
                <input type='hidden' value={item.id} name='gameID'/>
                <button >Rate {item.name}</button>
              </form>
              </li>
            );
    
            return (<li key={i}>You rated  <b>{item.name}</b> with score {item.rating}</li>);
            })}
        </ul></div>);  
      }       
      
      return (
         <div id='rateGameDiv'>
           <h2>Rate {this.state.game.name}</h2>
           <form onSubmit = {this.rateForm} id='ratingForm'>
             <label>Rating</label>
                <select name='rating' onChange = {this.onChange}>
                  <option value=''>Select rating</option>
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                  <option value='5'>5</option>
                </select><br/>
                <label>Feedback</label>
                <input type='text'  onChange = {this.onChange} name='feedback' id='feedbackInput'/>  
              <button>Rate Game</button>
           </form>
           <br/>
           <button onClick={this.backToGames}><b>Back to game List</b></button>
         </div>
      )  
  }
  render() {
    return (<div>
                <Header/>
                {this.dashboard()}
            </div>);
  }
}


export default Home;
