import { openDB } from 'idb';

const DB_NAME = 'requisition-app';
const DB_VERSION = 1;

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('requisitions')) {
                db.createObjectStore('requisitions', { keyPath: 'id' });
            }
            // Outbox for offline actions
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
}

export const offlineDB = {
    async saveRequisition(requisition: any) {
        const db = await initDB();
        await db.put('requisitions', requisition);
    },

    async saveRequisitions(requisitions: any[]) {
        const db = await initDB();
        const tx = db.transaction('requisitions', 'readwrite');
        const store = tx.objectStore('requisitions');
        await Promise.all([
            ...requisitions.map(req => store.put(req)),
            tx.done
        ]);
    },

    async getRequisitions() {
        const db = await initDB();
        return await db.getAll('requisitions');
    },

    async addToSyncQueue(operation: 'CREATE' | 'UPDATE' | 'DELETE', data: any) {
        const db = await initDB();
        await db.add('syncQueue', {
            operation,
            data,
            timestamp: Date.now(),
            synced: false,
        });
    },

    async getSyncQueue() {
        const db = await initDB();
        return await db.getAll('syncQueue');
    },

    async removeFromSyncQueue(id: number) {
        const db = await initDB();
        await db.delete('syncQueue', id);
    },

    async markSynced(id: number) {
        const db = await initDB();
        const item = await db.get('syncQueue', id);
        if (item) {
            item.synced = true;
            await db.put('syncQueue', item);
        }
    },
};
