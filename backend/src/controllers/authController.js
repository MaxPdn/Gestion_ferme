import User from "../models/User.js";
import jwt from "jsonwebtoken";

//generer token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//Inscription
export const register = async (req, res) => {
    //donner formulaire
    const { username, email, password } = req.body;

    //verifier si l'utilisateur existe
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Cet email existe déjà" });

    //créer un nouvel utilisateur
    const user = await User.create({
        username,
        email,
        password
    })

    //retourner token
    res.json({
        token: generateToken(user._id)
    })
}

//login
export const login = async (req, res) => {
    //recuperer email et password du formulaire
    const { email, password } = req.body;

    //recuperer l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Cet email n'existe pas" });

    //comparer le mdp
    const isMatch = await user.comparePassword(password); 
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    //retourner token
    res.json ({
        token: generateToken(user._id) 
    })
}

//restauration du mdp
export const resetPassword = async (req, res) => {

    //recuperer email et nouveau mdp
  const { email, newPassword } = req.body;

  //recuperer l'utilisateur par email
  const user = await User.findOne({ email });

  //si non trouvé
  if (!user)
    return res.status(400).json({ message: "Email introuvable" });

  //hasher le nouveau mdp
  user.password = newPassword;
  await user.save();

  res.json({ message: "Mot de passe réinitialisé" });
};