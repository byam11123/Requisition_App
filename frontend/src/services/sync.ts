import { offlineDB } from './indexedDB';
import { requisitionAPI } from './api';

export async function syncOfflineChanges() {
    const queue = await offlineDB.getSyncQueue();

    if (queue.length === 0) return;
    console.log(`Syncing ${queue.length} offline changes...`);

    for (const item of queue) {
        if (item.synced) continue;

        try {
            if (item.operation === 'CREATE') {
                const { id, ...dataToSync } = item.data; // Exclude local ID if strictly generating on server
                // Ideally we handle ID mapping, for now assume server generates ID
                await requisitionAPI.create(dataToSync);
            }
            // Handle UPDATE, DELETE similarly

            // Remove from queue after successful sync
            await offlineDB.removeFromSyncQueue(item.id);
        } catch (error) {
            console.error('Sync failed for item', item, error);
            // Optional: Logic to retry later or mark as error
        }
    }
}

export function initSync() {
    window.addEventListener('online', () => {
        console.log('App is online. Syncing...');
        // Show toast?
        syncOfflineChanges();
    });

    window.addEventListener('offline', () => {
        console.log('App is offline. Changes will be queued.');
        // Show toast?
    });

    // Initial sync check
    if (navigator.onLine) {
        syncOfflineChanges();
    }
}
