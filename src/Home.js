import React from 'react';  
import Header from './Header';
import cookie from 'react-cookies'; 
import axios from 'axios';



class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {gameID: '1', comment:'', rating: ''};
  }
  //----------------------------------------------------------------------
   onChange = (e) => { 
    this.setState({ [e.target.name]: e.target.value });
  }
  //-----------------------------------------------------------------------
  rateForm = async (e) =>{
     e.preventDefault();

     try {
      let res = await axios.post('/rate', this.state);         
      if (res.data.error){
        return alert(res.data.error);  
      }
      return alert(res.data.success);  
    } catch (e) {
      alert("System error occurred: "+e.message);
    }
  }

  dashboard(){
      let userCookie =  JSON.parse(cookie.load('user').substring(2));
       
      if (userCookie.username == 'admin')
      return (<h2>Admin Dashboard</h2>);

      return (
         <div>
           <h2>Rate a game</h2>
           <form onSubmit = {this.rateForm} id='ratingForm'>
             <label>Rating</label>
                <select name='rating' onChange = {this.onChange}>
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                  <option value='5'>5</option>
                </select><br/>
                <label>Feedback</label>
                <input type='text'  onChange = {this.onChange} name='feedback'/>  
              <button>Rate Game</button>
           </form>
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
