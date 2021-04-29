import { Connection } from '../../src';

export const shared: Partial<{
    mongoPort: number;
    conn: Connection;
}> = {
    mongoPort: 27017, // Number(process.env.MONGO_PORT) || 37017,
};
