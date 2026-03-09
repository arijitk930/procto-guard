import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILog extends Document {
  session: Types.ObjectId;
  type: "tab_switch" | "fullscreen_exit" | "webcam_snapshot";
  payload: string;
}

const logSchema = new Schema<ILog>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["tab_switch", "fullscreen_exit", "webcam_snapshot"],
      required: true,
    },
    payload: { type: String, required: true },
  },
  { timestamps: true },
);

export const Log = mongoose.model<ILog>("Log", logSchema);
