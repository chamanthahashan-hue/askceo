const Request = require('../models/Request');
const Category = require('../models/Category');
const { generateRequestCode } = require('../utils/generateRequestCode');
const { getIo } = require('../socket');

function parseFilters(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.branch) filter.branch = query.branch;
  if (query.categoryId) filter.categoryId = query.categoryId;
  return filter;
}

async function createRequest(req, res) {
  const { categoryId, title, description, priority } = req.body;

  if (!categoryId || !title || !description || !priority) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const attachments = (req.files || []).map((file) => `/uploads/${file.filename}`);

  const request = await Request.create({
    requestCode: generateRequestCode(),
    categoryId,
    title,
    description,
    priority,
    branch: req.user.branch,
    employeeId: req.user._id,
    attachments,
    thread: [
      {
        userId: req.user._id,
        message: description,
        type: 'request'
      }
    ]
  });

  const populated = await request.populate(['categoryId', 'employeeId', 'thread.userId']);
  const io = getIo();
  if (io) {
    io.to('admin').emit('request:new', populated);
  }

  return res.status(201).json({ request: populated });
}

async function listRequests(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  const filter = parseFilters(req.query);
  if (req.user.role !== 'admin') {
    filter.employeeId = req.user._id;
  }

  const [items, total] = await Promise.all([
    Request.find(filter)
      .populate('categoryId employeeId thread.userId')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Request.countDocuments(filter)
  ]);

  return res.json({
    requests: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
}

async function getRequest(req, res) {
  const request = await Request.findById(req.params.id).populate('categoryId employeeId thread.userId');
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  if (req.user.role !== 'admin' && String(request.employeeId._id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return res.json({ request });
}

async function replyToRequest(req, res) {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const request = await Request.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  if (req.user.role !== 'admin' && String(request.employeeId) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (['Approved', 'Rejected'].includes(request.status)) {
    return res.status(400).json({ message: 'Request already closed' });
  }

  request.thread.push({ userId: req.user._id, message: message.trim(), type: 'reply' });
  if (req.user.role === 'admin') {
    request.status = 'In Progress';
  }
  await request.save();

  const populated = await Request.findById(request._id).populate('categoryId employeeId thread.userId');
  const io = getIo();
  if (io) {
    io.to(`user:${request.employeeId}`).emit('request:updated', populated);
    io.to('admin').emit('request:updated', populated);
  }

  return res.json({ request: populated });
}

async function decideRequest(req, res) {
  const { status, reason } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Approved or Rejected' });
  }
  if (!reason?.trim()) {
    return res.status(400).json({ message: 'Reason is required' });
  }

  const request = await Request.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  request.status = status;
  request.closedAt = new Date();
  request.thread.push({
    userId: req.user._id,
    message: `${status}: ${reason.trim()}`,
    type: 'decision'
  });
  await request.save();

  const populated = await Request.findById(request._id).populate('categoryId employeeId thread.userId');
  const io = getIo();
  if (io) {
    io.to(`user:${request.employeeId}`).emit('request:updated', populated);
    io.to('admin').emit('request:updated', populated);
  }

  return res.json({ request: populated });
}

async function dashboardStats(req, res) {
  const [total, pending, completed, breakdown] = await Promise.all([
    Request.countDocuments(),
    Request.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
    Request.countDocuments({ status: { $in: ['Approved', 'Rejected'] } }),
    Request.aggregate([
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $in: ['$status', ['Pending', 'In Progress']] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $in: ['$status', ['Approved', 'Rejected']] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          categoryId: '$category._id',
          categoryName: '$category.name',
          total: 1,
          pending: 1,
          completed: 1
        }
      },
      { $sort: { total: -1 } }
    ])
  ]);

  return res.json({ total, pending, completed, breakdown });
}

module.exports = {
  createRequest,
  listRequests,
  getRequest,
  replyToRequest,
  decideRequest,
  dashboardStats
};
