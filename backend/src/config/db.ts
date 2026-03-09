import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI as string,
    );
    console.log(
      `\n✅ MongoDB Connected Successfully! Host: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.error("\n❌ MongoDB Connection FAILED: ", error);
    process.exit(1);
  }
};
