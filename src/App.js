import React from 'react';
import Home from './Home'; 
import Auth from './Auth'; 
import cookie from 'react-cookies'; 
class App extends React.Component {
  constructor(props) {
    super(props);   
    this.myroute = cookie.load('user')?<Home/>:<Auth/>;
  }  
         
render() { 
  return (
    <div>
      {this.myroute}
    </div>
  )
 }
}

export default App;
