import mongoose from "mongoose";

const ProcessedEventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true },
});

const ProcessedEvent =
  mongoose.models.ProcessedEvent ||
  mongoose.model("ProcessedEvent", ProcessedEventSchema);

export default ProcessedEvent;
