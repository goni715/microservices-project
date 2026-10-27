import mongoose from 'mongoose';
import envConfig from '../config/env';
import logger from './logger';

const dbConnect = async () => {
    try {
        await mongoose.connect(envConfig.chat_db_url);
        logger.info('Chat Database Connection success');
    }
    catch (err) {
        logger.error('Chat Database connection failled');
        logger.error(err);
    }
}

export default dbConnect;