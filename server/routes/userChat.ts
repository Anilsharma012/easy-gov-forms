import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { ChatMessage } from '../models/ChatMessage';
import { Lead } from '../models/Lead';
import { CSCCenter } from '../models/CSCCenter';
import { User } from '../models/User';

const router = Router();

router.get('/my-csc', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const lead = await Lead.findOne({
      $or: [
        { email: user.email },
        { mobile: user.phone },
      ],
    }).populate('assignedCenterId');

    if (!lead || !lead.assignedCenterId) {
      return res.json({ cscCenter: null, message: 'No CSC center assigned to you' });
    }

    const cscCenter = await CSCCenter.findById(lead.assignedCenterId).select('centerName mobile email address district state');

    res.json({ cscCenter, leadId: lead._id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch CSC center' });
  }
});

router.get('/conversations', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const messages = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId, senderType: 'user' },
            { receiverId: userId, receiverType: 'user' },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    res.json({ conversations: messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch conversations' });
  }
});

router.get('/messages/:conversationId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    await ChatMessage.updateMany(
      { conversationId, receiverId: userId, receiverType: 'user', read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch messages' });
  }
});

router.post('/send', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { receiverId, receiverType, content, type, fileUrl, fileName } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const conversationId = [userId, receiverId].sort().join('_');

    const message = new ChatMessage({
      senderId: userId,
      senderType: 'user',
      receiverId,
      receiverType: receiverType || 'csc',
      conversationId,
      content,
      type: type || 'text',
      fileUrl,
      fileName,
    });

    await message.save();

    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
});

router.get('/unread-count', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const count = await ChatMessage.countDocuments({
      receiverId: userId,
      receiverType: 'user',
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch unread count' });
  }
});

export default router;
