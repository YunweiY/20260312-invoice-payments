import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Returns backend availability and current server time.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
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
