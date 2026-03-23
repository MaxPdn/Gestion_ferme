import User from "../models/User.js";
import jwt from "jsonwebtoken";

//generer token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Identifiants invalides" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Identifiants invalides" });

        res.json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//restauration du mdp
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email introuvable" });

        user.password = newPassword;
        await user.save();

        res.json({ message: "Mot de passe réinitialisé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};