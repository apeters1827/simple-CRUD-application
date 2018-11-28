import crypto from 'crypto';

const secret = process.env.SECRET;

export default value => crypto.createHmac('sha256', secret)
  .update(value)
  .digest('hex');
