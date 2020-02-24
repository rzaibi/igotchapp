import React from 'react';
import avatar from './login-avatar.png';
import axios from 'axios';


class Auth extends React.Component {
  state = {'message':''};

  constructor(props) {
    super(props);   
  }

  mySubmitForm =  async (e) => {
    e.preventDefault();

    try {
      let res = await axios.post('/login', this.state); 
            
      if(!res.data.username){
        this.setState({message: "Username and password do not match!"});
        return false;
      }  
      window.location.reload();

    } catch (e) {
      alert("System error occurred: "+e.message);
    }
};
   
//-----------------------------------------------------------------------
onChange = (e) => { 
    this.setState({ [e.target.name]: e.target.value });
 }

render() { 
  return (
    <div id='login-container'>
      <div id='msgHolder'>{this.state.message}</div>  
      <h2>iGotchApp Login</h2>
     <form method="POST" onSubmit={this.mySubmitForm} id='login-form'> 
     <div className="avatar-container">
        <img src={avatar} alt="Avatar" className="avatar"/>
    </div>    
     <label>Username</label>
     <input type="text" name="username" onChange = {this.onChange} placeholder="Enter your username"/>
     <label>Password</label>
     <input type="password" name="password" onChange = {this.onChange} placeholder="Enter your password"/>
     <button>Submit</button>
    </form> 
    </div>
  );
 }
}

export default Auth;
