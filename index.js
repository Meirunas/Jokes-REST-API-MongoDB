const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://meirunassmi:kFSNxYCeDldrTSPl@cluster0.cfzezbp.mongodb.net/jokes?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define Joke Schema
const jokeSchema = new mongoose.Schema({
  joke: {
      type: String,
      required: true
  }
});

// Define Joke Model
const Joke = mongoose.model('Joke', jokeSchema);

// Sample jokes data
const sampleJokes = [
    "Why couldn't the bicycle stand up by itself? Because it was two-tired.",
    "I'm reading a book on anti-gravity. It's impossible to put down.",
    "Did you hear about the guy who invented Lifesavers? He made a mint.",
    "I used to be a baker, but I couldn't make enough dough.",
    "What do you call a pile of cats? A meowntain.",
    "What do you get when you cross a snowman and a vampire? Frostbite."
];

// Function to initialize sample jokes data
async function initializeSampleJokes() {
    try {
        await Joke.deleteMany({});
        await Joke.insertMany(sampleJokes.map(joke => ({ joke })));
        console.log('Sample jokes data initialized');
    } catch (error) {
        console.error('Error initializing sample jokes:', error);
    }
}

// Initialize sample jokes data
initializeSampleJokes();

app.set('view engine', 'ejs'); // Set EJS as the view engine

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define a route to add a new joke
app.post('/jokes', async (req, res) => {
    try {
        const { joke } = req.body;

        // Create a new joke instance
        const newJoke = new Joke({ joke });

        // Save the joke to the database
        await newJoke.save();

        res.status(201).json(newJoke);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add joke' });
    }
});

// Define a route to retrieve all jokes
app.get('/jokes', async (req, res) => {
    try {
        const jokes = await Joke.find();
        res.render('jokes', { jokes }); // Render the 'jokes' view and pass jokes data
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve jokes' });
    }
});

// Define a route to retrieve a random joke
app.get('/randomjoke', async (req, res) => {
  try {
      const count = await Joke.countDocuments();
      const random = Math.floor(Math.random() * count);
      const randomJoke = await Joke.findOne().skip(random);
      res.render('randomjoke', { joke: randomJoke.joke }); // Render the 'randomjoke' view and pass random joke data
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve random joke' });
  }
});

// Define a route to redirect from the root path to /jokes
app.get('/', (req, res) => {
  res.redirect('/jokes');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
