import { Router, Response } from 'express';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { SupportTicket } from '../models/SupportTicket';

const router = Router();

router.get('/my-tickets', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tickets = await SupportTicket.find({ userId }).sort({ updatedAt: -1 });
    res.json({ tickets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
  }
});

router.post('/create-ticket', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, category, message, priority } = req.body;

    const ticket = new SupportTicket({
      userId,
      subject,
      category,
      priority: priority || 'medium',
      messages: [{
        sender: 'user',
        message,
        timestamp: new Date(),
      }],
    });

    await ticket.save();
    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create ticket' });
  }
});

router.post('/:ticketId/message', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { ticketId } = req.params;
    const { message } = req.body;

    const ticket = await SupportTicket.findOne({ _id: ticketId, userId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return res.status(400).json({ message: 'Cannot reply to closed/resolved ticket' });
    }

    ticket.messages.push({
      sender: 'user',
      message,
      timestamp: new Date(),
    });

    await ticket.save();
    res.json({ message: 'Message sent successfully', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
});

router.get('/all', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ tickets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
  }
});

router.post('/admin/:ticketId/reply', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { message, status } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: 'support',
      message,
      timestamp: new Date(),
    });

    if (status) {
      ticket.status = status;
    } else if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    await ticket.save();
    res.json({ message: 'Reply sent successfully', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send reply' });
  }
});

router.patch('/admin/:ticketId/status', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Status updated successfully', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update status' });
  }
});

export default router;
