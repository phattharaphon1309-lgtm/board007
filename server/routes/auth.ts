import express from 'express';
import bcrypt from 'bcryptjs';
import { db, toSafeUser } from '../db.js';
import { createToken, revokeToken, requireAuth, AuthRequest } from '../authMiddleware.js';
import { User } from '../types.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, displayName, password, email, phoneNumber, citizenId, bio } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้, อีเมล และรหัสผ่านให้ครบถ้วน' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (db.findUserByUsername(cleanUsername)) {
      return res.status(409).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น' });
    }

    if (db.findUserByEmail(email.trim().toLowerCase())) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' });
    }

    // Password Hashing via bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      displayName: displayName?.trim() || cleanUsername,
      passwordHash,
      role: 'user', // Default role is user
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber?.trim() || '08' + Math.floor(10000000 + Math.random() * 90000000),
      citizenId: citizenId?.trim() || '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10000 + Math.random() * 90000) + '-01-1',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
      bio: bio?.trim() || 'ยินดีที่ได้รู้จักชาว PunX ทุกคนครับ/ค่ะ!',
      isVerified: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    const token = createToken(newUser.id);
    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ PunX!',
      token,
      user: toSafeUser(newUser, true),
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be username or email

    if (!loginId || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน' });
    }

    const clean = loginId.trim();
    let user = db.findUserByUsername(clean);
    if (!user) {
      user = db.findUserByEmail(clean);
    }

    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = createToken(user.id);
    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ!',
      token,
      user: toSafeUser(user, true),
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Firebase Google Login
router.post('/firebase-login', async (req, res) => {
  try {
    const { email, displayName, photoUrl, uid } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ error: 'ข้อมูล Firebase ไม่ครบถ้วน' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.findUserByEmail(cleanEmail);

    if (!user) {
      // Create user from Firebase Google profile
      const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(100 + Math.random() * 900);
      const dummyPasswordHash = await bcrypt.hash(uid + Date.now(), 10);
      const isAdminEmail = cleanEmail === 'phattharaphon1309@gmail.com';

      user = {
        id: uid,
        username,
        displayName: displayName || cleanEmail.split('@')[0],
        passwordHash: dummyPasswordHash,
        role: isAdminEmail ? 'admin' : 'user',
        email: cleanEmail,
        phoneNumber: '08' + Math.floor(10000000 + Math.random() * 90000000),
        citizenId: '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10000 + Math.random() * 90000) + '-99-9',
        avatar: photoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        bio: 'เข้าสู่ระบบผ่าน Google Firebase บัญชีทางการ ✨',
        isVerified: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };
      db.addUser(user);
    }

    const token = createToken(user.id);
    return res.json({
      message: 'เข้าสู่ระบบผ่าน Firebase สำเร็จ!',
      token,
      user: toSafeUser(user, true),
    });
  } catch (err: any) {
    console.error('Firebase login error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ Firebase' });
  }
});

// Get current user (Me)
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });
  return res.json({
    user: toSafeUser(req.user, true),
  });
});

// Logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    revokeToken(token);
  }
  return res.json({ message: 'ออกจากระบบสำเร็จ' });
});

// Update Profile (Form 3 requirement - User input saved to DB and returned)
router.put('/profile', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { displayName, bio, phoneNumber, avatar } = req.body;

  const updates: Partial<User> = {};
  if (typeof displayName === 'string' && displayName.trim().length > 0) {
    updates.displayName = displayName.trim();
  }
  if (typeof bio === 'string') {
    updates.bio = bio.trim();
  }
  if (typeof phoneNumber === 'string' && phoneNumber.trim().length >= 9) {
    updates.phoneNumber = phoneNumber.trim();
  }
  if (typeof avatar === 'string' && avatar.trim().length > 0) {
    updates.avatar = avatar.trim();
  }

  const updatedUser = db.updateUser(req.user.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }

  return res.json({
    message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ!',
    user: toSafeUser(updatedUser, true),
  });
});

// Quick demo users list for testing roles
router.get('/demo-accounts', (_req, res) => {
  return res.json([
    {
      username: 'admin_official',
      role: 'admin',
      displayName: 'ผู้ดูแลระบบ PunX (Admin)',
      description: 'สิทธิ์แอดมิน: ปักหมุด/ล็อคกระทู้, ลบกระทู้ใดก็ได้, จัดการสมาชิก, ตรวจสอบ Log',
      passwordPlain: 'Admin@123456',
    },
    {
      username: 'somchai_pantip',
      role: 'user',
      displayName: 'สมชาย เซียนพันทิป (เจ้าของกระทู้ไอที 5 ปี)',
      description: 'สิทธิ์ผู้ใช้ทั่วไป: จัดการกระทู้ของตัวเองได้เท่านั้น ไม่สามารถแก้ไขของผู้อื่นได้',
      passwordPlain: 'User@123456',
    },
    {
      username: 'nong_x_trendy',
      role: 'user',
      displayName: 'น้องเอ็กซ์ สายเทรนด์ (เจ้าของกระทู้ดราม่าซีรีส์)',
      description: 'สิทธิ์ผู้ใช้ทั่วไป: ทดสอบลองแก้ไขกระทู้ของสมชาย (จะพบข้อความปฏิเสธสิทธิ์)',
      passwordPlain: 'User@123456',
    },
  ]);
});

export default router;
