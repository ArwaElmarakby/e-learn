const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

let blacklistedTokens = [];

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};



// Signup logic
const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(40).json({ message: 'User already exists' });

    const user = new User({ username, email, password, role: role || 'client' });
    await user.save();

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    res.cookie("jwt",refreshToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: "None",  
      maxAge: 30 * 24 * 60 * 60 * 1000   
    });
  res.status(201).json({token, _id: user._id, role: user.role});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login logic
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    res.cookie("jwt",refreshToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: "None",  
      maxAge: 30 * 24 * 60 * 60 * 1000   
    });
  res.status(201).json({token, _id: user._id, role: user.role});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//check refresh token
const refresh = (req,res) => {
  try{
      const cookies = req.cookies;   
  if(!cookies?.jwt){              
      return  res.status(401).json({msg: "Unauthorized"});
  }
  const refreshToken = cookies.jwt;
  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET, async(err,decoded) => {   

      if(err){
          return res.status(403).json({msg: "Forbidden"});    
      }
      const user = await User.findById(decoded.id).exec();
      if(!user){
          return res.status(401).json({msg: "Unauthorized"});

      }
      const accessToken = jwt.sign({id: user._id, role: user.role},process.env.JWT_SECRET,{expiresIn: "30d"});
      res.json({accessToken, _id: user._id, role: user.role});    
  });
  }
  catch (error){
      return res.status(401).json({msg: error.message});

  }
  
};


const logout = (req, res) => {
  const cookies = req.cookies;
  const authHeader = req.headers.authorization;
  let token;

  if (!cookies?.jwt && !authHeader) {
      return res.sendStatus(204); 
  }

  // Get the access token from headers if available.
  if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
  } else {
      
      token = cookies.jwt;
  }


  if (token && !blacklistedTokens.includes(token)) {
      blacklistedTokens.push(token);
  }


  res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
  });
  
  res.json({ msg: "Logged out successfully" });
};


// const getAllUsers = async (req, res) => {
//   try {
//     if (req.user.role !== 'instructor') {
//       return res.status(403).json({ message: 'Access forbidden: You do not have the required role' });
//     }
//     const users = await User.find({});
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// Update user details
const updateUser = async (req, res) => {
  const { username, password} = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    if (username) {
      user.username = username;
    }

  

    
    if (password) {
      user.password = password; 
    }

    
    await user.save();
    res.status(200).json({ message: 'User details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID without authentication
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req,res) => {
  try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
          return res.status(404).json({ msg: "User not found" });
      }

      res.status(200).json({ msg: "User deleted successfully"});

  } catch (error) {
      res.status(500).json({ msg: error.message });
  }

};




module.exports = { signup, login, refresh, logout, updateUser, getUserProfile, deleteUser,blacklistedTokens};
