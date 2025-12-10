import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    websiteName: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUsername: {
      type: String,
      required: true,
      trim: true,
    },
    websitePassword: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Password = mongoose.model('Password', passwordSchema);

export default Password;
