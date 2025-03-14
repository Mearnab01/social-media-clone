import mongoose from "mongoose";
const conncetDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDb connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Failed to connct to mongoDb ", error);
    process.exit(1);
  }
};
export default conncetDb;
