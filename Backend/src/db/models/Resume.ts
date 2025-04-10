import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  skills: string[];
  fileName?: string;
  uploadDate: Date;
}

const ResumeSchema = new Schema({
  skills: {
    type: [String],
    required: true
  },
  fileName: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IResume>('Resume', ResumeSchema);
