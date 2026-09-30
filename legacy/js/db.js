/**
 * PAK Konversi Dosen — IndexedDB Data Layer
 * Handles all CRUD operations for the application
 */

const DB_NAME = 'pak_konversi_db';
const DB_VERSION = 1;

const STORES = {
  PEGAWAI: 'pegawai',
  PEJABAT: 'pejabat_penilai',
  PENILAIAN: 'penilaian_konversi',
  PENETAPAN: 'pak_penetapan',
};

let dbInstance = null;

/**
 * Initialize / open IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Pegawai (Dosen) store
      if (!db.objectStoreNames.contains(STORES.PEGAWAI)) {
        const pegawaiStore = db.createObjectStore(STORES.PEGAWAI, { keyPath: 'id', autoIncrement: true });
        pegawaiStore.createIndex('nip', 'nip', { unique: true });
        pegawaiStore.createIndex('nama_lengkap', 'nama_lengkap', { unique: false });
        pegawaiStore.createIndex('jabatan_fungsional', 'jabatan_fungsional', { unique: false });
        pegawaiStore.createIndex('unit_kerja', 'unit_kerja', { unique: false });
      }

      // Pejabat Penilai store
      if (!db.objectStoreNames.contains(STORES.PEJABAT)) {
        const pejabatStore = db.createObjectStore(STORES.PEJABAT, { keyPath: 'id', autoIncrement: true });
        pejabatStore.createIndex('nip_pejabat', 'nip_pejabat', { unique: false });
      }

      // Penilaian Konversi store
      if (!db.objectStoreNames.contains(STORES.PENILAIAN)) {
        const penilaianStore = db.createObjectStore(STORES.PENILAIAN, { keyPath: 'id', autoIncrement: true });
        penilaianStore.createIndex('pegawai_id', 'pegawai_id', { unique: false });
        penilaianStore.createIndex('tahun', 'tahun', { unique: false });
      }

      // PAK Penetapan store
      if (!db.objectStoreNames.contains(STORES.PENETAPAN)) {
        const penetapanStore = db.createObjectStore(STORES.PENETAPAN, { keyPath: 'id', autoIncrement: true });
        penetapanStore.createIndex('pegawai_id', 'pegawai_id', { unique: false });
        penetapanStore.createIndex('nomor_surat', 'nomor_surat', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };
  });
}

/**
 * Generic transaction helper
 */
async function getStore(storeName, mode = 'readonly') {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

/**
 * Add a single record
 */
async function addRecord(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update a record (put)
 */
async function updateRecord(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a record by key
 */
async function deleteRecord(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a single record by key
 */
async function getRecord(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all records from a store
 */
async function getAllRecords(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get record by index value
 */
async function getByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.get(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all records matching an index value
 */
async function getAllByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Bulk add records (for Excel import)
 */
async function bulkAdd(storeName, records) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    let addedCount = 0;
    const errors = [];

    records.forEach((record, index) => {
      const request = store.add(record);
      request.onsuccess = () => addedCount++;
      request.onerror = () => {
        errors.push({ index, error: request.error?.message || 'Unknown error', data: record });
        request.onerror = null; // prevent tx abort
      };
    });

    tx.oncomplete = () => resolve({ addedCount, errors });
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => resolve({ addedCount, errors });
  });
}

/**
 * Bulk upsert (add or update by NIP)
 */
async function bulkUpsert(storeName, records) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    let upsertedCount = 0;
    const errors = [];

    records.forEach((record, index) => {
      const request = store.put(record);
      request.onsuccess = () => upsertedCount++;
      request.onerror = () => {
        errors.push({ index, error: request.error?.message || 'Unknown error', data: record });
      };
    });

    tx.oncomplete = () => resolve({ upsertedCount, errors });
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Count records in a store
 */
async function countRecords(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all records in a store
 */
async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Export for use
window.DB = {
  STORES,
  openDB,
  addRecord,
  updateRecord,
  deleteRecord,
  getRecord,
  getAllRecords,
  getByIndex,
  getAllByIndex,
  bulkAdd,
  bulkUpsert,
  countRecords,
  clearStore,
};
