import React from 'react';  
import Header from './Header';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '' };
  }
 
  dashboard(){
      return <h2>Dashboard</h2>;
  }
  render() {
    return (<div>
                <Header/>
                {this.dashboard()}
            </div>);
  }
}


export default Home;
