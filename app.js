require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

hbs.registerPartials(__dirname + "/views/partials");

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:

app.get("/", (req, res, next) => {
    res.render("home")
})

app.get("/artist-search", (req, res, next) => {
  spotifyApi
  .searchArtists(req.query.artist)
  .then(data => {
    const artists = data.body.artists.items;
    const artistsInfo = {
        info: artists.map ((artist) => {
            return {
                ...artist
            }
        })
    }
    console.log('The received data from the API: ', artistsInfo);
    res.render('artist-search-results', artistsInfo)
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get("/albums/:artistId", (req, res, next) => {
    const artistId = req.params.artistId;

    spotifyApi.getArtistAlbums(artistId).then(
        function(data) {
            const albums = data.body.items;
            const albumsInfo = {
                info: albums.map ((album) => {
                    return {
                        ...album
                    }
                })
            }
          console.log('Artist albums', albumsInfo);
          return new Promise ((resolve) => {
              resolve(albumsInfo)
          })
          .then (
            res.render("albums", albumsInfo)
          )
        },
        function(err) {
          console.error(err);
        }
      );
})

app.get("/tracks/:albumId", (req, res, next) => {
  const albumId = req.params.albumId;

  spotifyApi.getAlbumTracks(albumId, { limit : 5, offset : 1 })
  .then(function(data) {
    const tracks = data.body.items;
    console.log("data: ", data)
    console.log("tracksArr: ", tracks);
    res.render("tracks", {info: tracks})
  }, function(err) {
    console.log('Something went wrong!', err);
  });
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));