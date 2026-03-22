import mongoose from "mongoose"
import bcrypt from "bcrypt"

//chema pour l'inscription & connexion
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
},{
        timestamps:true
    })

    //hacher le mdp
    userSchema.pre("save", async function(next){
        if(!this.isModified("password")) return;
        this.password = await bcrypt.hash(this.password, 10);
        next();
    })

    //comparer le mdp
    userSchema.methods.comparePassword = async function(enteredPassword){
        return await bcrypt.compare(enteredPassword, this.password);
    }

    export default mongoose.model("User", userSchema);
