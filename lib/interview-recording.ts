export type StoredInterviewRecording = {
    interviewId: string;
    blob: Blob;
    createdAt: number;
    mimeType: string;
    fileName: string;
};

const DB_NAME = "prepwise-interview-assets";
const STORE_NAME = "recordings";
const DB_VERSION = 1;

const canUseIndexedDb = () =>
    typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

const openRecordingDatabase = async () => {
    if (!canUseIndexedDb()) {
        return null;
    }

    return await new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: "interviewId" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open the recording database."));
    });
};

export async function saveInterviewRecording(recording: StoredInterviewRecording) {
    const database = await openRecordingDatabase();

    if (!database) {
        return false;
    }

    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).put(recording);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error ?? new Error("Unable to save the recording."));
            transaction.onabort = () => reject(transaction.error ?? new Error("Recording save was aborted."));
        });

        return true;
    } finally {
        database.close();
    }
}

export async function getInterviewRecording(interviewId: string) {
    const database = await openRecordingDatabase();

    if (!database) {
        return null;
    }

    try {
        return await new Promise<StoredInterviewRecording | null>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(interviewId);

            request.onsuccess = () => {
                resolve((request.result as StoredInterviewRecording | undefined) ?? null);
            };
            request.onerror = () => reject(request.error ?? new Error("Unable to load the recording."));
        });
    } finally {
        database.close();
    }
}

export async function deleteInterviewRecording(interviewId: string) {
    const database = await openRecordingDatabase();

    if (!database) {
        return false;
    }

    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).delete(interviewId);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error ?? new Error("Unable to delete the recording."));
            transaction.onabort = () => reject(transaction.error ?? new Error("Recording delete was aborted."));
        });

        return true;
    } finally {
        database.close();
    }
}
