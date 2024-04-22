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

    useEffect(()=>{
      async function fetchMovies(){
        try{
          setIsLoading(true);
          setError("");
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`)
          
          if(!res.ok) throw new Error("Something went wrong in fectching movies")
          
          
          const data = await res.json();

          if(data.Response === 'False') throw new Error("Movie not Found")

          setMovies(data.Search)
        }
        catch(err){
          console.log(err.message);
          setError(err.message);
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

      fetchMovies();
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
            {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie}/> 
              :<>
                  <WatchedSummary watched={watched}/>
                  <WatchedMovieList watched={watched}/>
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

function MovieDetails({selectedId,onCloseMovie}){
  const [movie,setMovie] = useState({});
  const {
    Title: title,
    Year: year,
    Poster: poster,
    RUntime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors : actors,
    Director: director,
    Genre: genre
  } = movie;

  useEffect(function(){
    async function getMovieDetails(){
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json();
      setMovie(data);
    };


    getMovieDetails();
  }, [])

  return(
    <div className="details">
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
          <StarRating maxRating={10} size={24}/>
        </div>
        <p><em>{plot}</em></p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({watched}){

  return(
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie}  key={movie.imdbID}/>
      ))}
    </ul>
  )
}

function WatchedMovie({movie}){
  return(
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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
      </div>
    </li>
  )
}



