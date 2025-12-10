import express from 'express';
import Password from '../models/Password.js';
import { protect } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const decryptedPasswords = passwords.map((password) => ({
      _id: password._id,
      websiteName: password.websiteName,
      websiteUrl: password.websiteUrl,
      websiteUsername: password.websiteUsername,
      websitePassword: decrypt(password.websitePassword),
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    }));

    res.json(decryptedPasswords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { websiteName, websiteUrl, websiteUsername, websitePassword } =
      req.body;

    if (!websiteName || !websiteUrl || !websiteUsername || !websitePassword) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const encryptedPassword = encrypt(websitePassword);

    const password = await Password.create({
      userId: req.user._id,
      websiteName,
      websiteUrl,
      websiteUsername,
      websitePassword: encryptedPassword,
    });

    res.status(201).json({
      _id: password._id,
      websiteName: password.websiteName,
      websiteUrl: password.websiteUrl,
      websiteUsername: password.websiteUsername,
      websitePassword,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const password = await Password.findById(req.params.id);

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    if (password.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { websiteName, websiteUrl, websiteUsername, websitePassword } =
      req.body;

    password.websiteName = websiteName || password.websiteName;
    password.websiteUrl = websiteUrl || password.websiteUrl;
    password.websiteUsername = websiteUsername || password.websiteUsername;

    if (websitePassword) {
      password.websitePassword = encrypt(websitePassword);
    }

    const updatedPassword = await password.save();

    res.json({
      _id: updatedPassword._id,
      websiteName: updatedPassword.websiteName,
      websiteUrl: updatedPassword.websiteUrl,
      websiteUsername: updatedPassword.websiteUsername,
      websitePassword: websitePassword || decrypt(updatedPassword.websitePassword),
      createdAt: updatedPassword.createdAt,
      updatedAt: updatedPassword.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const password = await Password.findById(req.params.id);

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    if (password.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Password.deleteOne({ _id: password._id });

    res.json({ message: 'Password removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
