import { useEffect, useState } from "react";
import StarRating from "./component/StarRating"
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const KEY = "f84fc31d";

  export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error,setError] = useState("");
    const [selectedId,setSelectedId] = useState(null);

    function handleSelectMovie(id){
      setSelectedId((prevId)=> id === prevId ? null : id );
    }

    function handleCloseMovie(){
      setSelectedId(null);
    }

    function handleAddWatchedMovie(movie){
      setWatched(prev=>[...prev,movie])
    }

    function handleDeleteWatchedMovie(id){
      setWatched(prev=>prev.filter((movie)=>movie.imdbID !== id));
    }

    useEffect(()=>{
      const controller = new AbortController();
      
      async function fetchMovies(){


        try{
          setIsLoading(true);
          setError("");
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,{signal: controller.signal})
          
          if(!res.ok) throw new Error("Something went wrong in fectching movies")
          
          
          const data = await res.json();

          if(data.Response === 'False') throw new Error("Movie not Found")

          setMovies(data.Search);
          setError("");
        }
        catch(err){
          console.error(err.message);

          if(err.name !== "AbortError"){
            setError(err.message);
          }
        }
        finally{
          setIsLoading(false);
        }
      }

      if(!query.length){
        setMovies([]);
        setError("");
        return
      } 

      handleCloseMovie();
      fetchMovies();

      return function(){
        controller.abort()
      }
    },[query]);

    return (
      <>
        <NavBar>
          <Search query={query} setQuery={setQuery}/>
           <NumResults movies={movies}/>
        </NavBar>
          
        <Main>
          <Box>
            {/* {isLoading?<Loader/>:<MovieList movies={movies} />} */}
            {isLoading && <Loader/>}
            {!isLoading && !error && <MovieList movies={movies} onSelectMOvie={handleSelectMovie}/>}
            {error && <ErrorMessage message={error}/>}
          </Box>

          <Box>
            {selectedId ? <MovieDetails 
                            selectedId={selectedId} 
                            onCloseMovie={handleCloseMovie} 
                            onAddWatchedMovie={handleAddWatchedMovie}
                            watched={watched}
                          /> 
              :<>
                  <WatchedSummary watched={watched}/>
                  <WatchedMovieList watched={watched} onDeleteWatchedMovie={handleDeleteWatchedMovie}/>
                </>
            }
          </Box> 
        </Main>
      </>
    );
  }

function Loader(){
  return <p className="loader">Loading...</p>
}

function ErrorMessage({message}){
  return <p className="error">⚠️{message}</p>
}

function NavBar({children}){
  
  return(
    <nav className="nav-bar">
        <Logo/>
        {children}
    </nav>
  )
}

function Logo(){
  return(
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({query, setQuery}){
  return(
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
  )
}

function NumResults({movies}){
  return(
    <p className="num-results">
          Found <strong>{movies.length}</strong> results
        </p>
  )
}


function Main({children}){
  
  return(
    <main className="main">
        {children}
    </main>

)
}

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);

  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && children}
        </div>
  )
}


function MovieList({movies,onSelectMOvie}){

  return(
    <ul className="list list-movies">
              {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onSelectMOvie={onSelectMOvie}/>
              ))}
            </ul>
  )
}

function Movie({movie,onSelectMOvie}){

  return(
    <li onClick={()=>onSelectMOvie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({selectedId,onCloseMovie,onAddWatchedMovie,watched}){
  const [movie,setMovie] = useState({});
  const [isLoading,setIsLoading] = useState(false);
  const [userRating,setUserRating] = useState("");

  const isWatched = watched.map(movie=>movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(movie=>movie.imdbID===selectedId)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster, 
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors : actors,
    Director: director,
    Genre: genre
  } = movie;

  function handleAdd(){
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating:Number(imdbRating),
      runtime:runtime.split(' ').at(0),
      userRating,
    }

    onAddWatchedMovie(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(()=>{
    function callback(e){
      if(e.code === "Escape"){
        onCloseMovie();
        // console.log("close")
      }
    }

    document.addEventListener("keydown",callback)

    return function(){
      document.removeEventListener("keydown",callback);
    };

  },[onCloseMovie]);

  useEffect(function(){
    async function getMovieDetails(){
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    };

    getMovieDetails();
  }, [selectedId]);

  useEffect(function(){
    if(!title) return;
    document.title = `Movie | ${title}`;

    return function(){
      document.title = "usePopcorn";
    }

  },[title])

  return(
    <div className="details">
      {isLoading?<Loader/>:
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
          <img src={poster} alt={`Poster of ${movie} movie`}/>
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p><span>⭐</span>{imdbRating} IMDB rating</p>
          </div>
        </header> 
        <section>
          <div className="rating">
            {!isWatched?
            <>
              <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>
              {userRating>0 && <button className="btn-add" onClick={handleAdd}>Add to List</button>}
            </>
          : <p>you rated this movie with {watchedUserRating} 🌟</p>
          }
          </div>
          <p><em>{plot}</em></p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>
        </section>
      </>
      }

    </div>
  )
}

function WatchedSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return(
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({watched,onDeleteWatchedMovie}){

  return(
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie}  key={movie.imdbID} onDeleteWatchedMovie={onDeleteWatchedMovie}/>
      ))}
    </ul>
  )
}

function WatchedMovie({movie,onDeleteWatchedMovie}){
  return(
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>onDeleteWatchedMovie(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}



