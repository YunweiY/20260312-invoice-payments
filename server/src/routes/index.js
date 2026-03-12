import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message:
        'Server is running. Current date and time: ' + new Date().toISOString(),
    },
  });
});

export default router;
