import mongoose from "mongoose";

const connectMongodb = async () => {
    try {
        const uri = process.env.MONGO_URI as string;
        await mongoose.connect(uri);
        console.log("🍃 MongoDB connected");
    } catch (error) {
        console.error("Error connecting mongodb", error);
        process.exit(1);

    }
}

export default connectMongodb;