import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  skills: string[];
  createdAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  skills: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IResume>('Resume', ResumeSchema);