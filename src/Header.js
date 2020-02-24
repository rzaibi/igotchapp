import React from 'react';  
 
class Header extends React.Component {
  constructor(props) {
    super(props); 
  } 
  render() {
    return (
     <div id='header'><h1>iGotchapp</h1><div id='userDiv'></div></div>
    );
  }
}


export default Header;
