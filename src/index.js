import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';

import StarRating from './component/StarRating';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Test(){
  const [movieRating,setMovieRating] = useState(0);
  return(
    <div>
      <StarRating
        maxRating={6} 
        color="cyan"
        size={90}
        className="test"
        defaultRating={3}
        onSetRating = {setMovieRating}  
      />
      <p>the movie rated {movieRating}</p>
    </div>
  )
}


root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating maxRating={5} messages = {['Terrible','Bad',"Okay","Good","Amazing"]}/>
    <StarRating 
      maxRating={10} 
      color="red"
      size={70}
      className="test"
      defaultRating={6}
      />

      <Test/>
  </React.StrictMode>
);
