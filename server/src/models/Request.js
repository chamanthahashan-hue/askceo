const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['request', 'reply', 'decision'], required: true }
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    requestCode: { type: String, required: true, unique: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], required: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    branch: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [{ type: String }],
    thread: [threadSchema],
    closedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
