import User from "../models/User.js";

// Créer un utilisateur (Admin seulement)
export const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Cet email existe déjà" });

        const user = await User.create({ username, email, password, role });

        res.status(201).json({
            message: "Utilisateur créé avec succès",
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
};

// Lire tous les utilisateurs
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;
        
        if (password) {
            user.password = password;
        }

        await user.save();

        res.json({
            message: "Utilisateur mis à jour avec succès",
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
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        // Empêcher l'admin de se supprimer lui-même (facultatif mais recommandé)
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
