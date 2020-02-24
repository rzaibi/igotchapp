import React from 'react';  
import cookie from 'react-cookies'; 

 
class Header extends React.Component {
  constructor(props) {
    super(props); 
  } 
  logout(){
    cookie.remove('user', { path: '/' });
    cookie.remove('game', { path: '/' });

    window.location.reload();
  }
  render() {
    return (
     <div id='header'><h1>iGotchapp</h1><button id='logoutButton' onClick={this.logout}>Logout</button></div>
    );
  }
}


export default Header;
