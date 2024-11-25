// const express = require('express');
// const app = express();
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();
// const path = require("path");
// const cors = require('cors');
// const cookieParser = require("cookie-parser"); 
// const authRoutes = require('./routes/authRoutes');
// const courseRoutes = require('./routes/courseRoutes');
// const purchaseRoutes = require('./routes/purchaseRoutes');
// const PORT = process.env.PORT || 5000;


// // Load environment variables from .env file
// dotenv.config();


// app.use(cors({
//     origin: 'http://localhost:5173'
//   }));
// app.use(cookieParser());

// app.use(express.static(path.join(__dirname, 'public')));

// // Middleware for parsing JSON requests
// app.use(express.json());
// app.use('/api/purchases', purchaseRoutes);
// app.use('/uploads', express.static('uploads'));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes);



// app.all("*",(req,res) => { 
//   res.status(404);
//   if(req.accepts("html")){  
//       res.sendFile(path.join(__dirname,"views","404.html"));
//   }else if(req.accepts("json")){  
//       res.json({msg: "404 Not Found"});
//   }else {
//       res.type("txt").send("404 Not Found");  
//   }
// });

// // Connect to MongoDB
// mongoose
// .connect(process.env.MONGO_URI)
// .then(() => {
//     console.log("Connectd DataBase Successfuly");
//     app.listen(PORT,() => {
//         console.log(`Server running on port ${PORT}`);
//     });
// })
// .catch((err) => {
//     console.log({msg: err});
// });

// app.get("/",(req, res) => {
//     res.json({ message: "Hello world from backend"})
// })


























const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const path = require("path");
const cors = require('cors');
const cookieParser = require("cookie-parser"); 
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const PORT = process.env.PORT || 5000;

// Load environment variables from .env file
dotenv.config();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON requests
app.use(express.json());
app.use('/api/purchases', purchaseRoutes);
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Route to display "Welcome"
app.get("/welcome", (req, res) => {
    res.send("Welcome");
});

app.all("*", (req, res) => { 
    res.status(404);
    if(req.accepts("html")) {  
        res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if(req.accepts("json")) {  
        res.json({msg: "404 Not Found"});
    } else {
        res.type("txt").send("404 Not Found");  
    }
});

// Connect to MongoDB
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to Database Successfully");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.log({msg: err});
});

app.get("/", (req, res) => {
    res.json({ message: "Hello world from backend"});
});
