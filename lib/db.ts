"use client";

import {
  Pegawai,
  PegawaiInput,
  Pejabat,
  Penilaian,
  PenilaianInput,
  Penetapan,
  PenetapanInput,
} from "@/lib/constants";

const DB_NAME = "pak_konversi_db";
const DB_VERSION = 1;

export const STORES = {
  PEGAWAI: "pegawai",
  PEJABAT: "pejabat_penilai",
  PENILAIAN: "penilaian_konversi",
  PENETAPAN: "pak_penetapan",
} as const;

let dbInstance: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.PEGAWAI)) {
        const pegawaiStore = db.createObjectStore(STORES.PEGAWAI, {
          keyPath: "id",
          autoIncrement: true,
        });
        pegawaiStore.createIndex("nip", "nip", { unique: true });
        pegawaiStore.createIndex("nama_lengkap", "nama_lengkap", {
          unique: false,
        });
        pegawaiStore.createIndex("jabatan_fungsional", "jabatan_fungsional", {
          unique: false,
        });
        pegawaiStore.createIndex("unit_kerja", "unit_kerja", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORES.PEJABAT)) {
        const pejabatStore = db.createObjectStore(STORES.PEJABAT, {
          keyPath: "id",
          autoIncrement: true,
        });
        pejabatStore.createIndex("nip_pejabat", "nip_pejabat", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(STORES.PENILAIAN)) {
        const penilaianStore = db.createObjectStore(STORES.PENILAIAN, {
          keyPath: "id",
          autoIncrement: true,
        });
        penilaianStore.createIndex("pegawai_id", "pegawai_id", {
          unique: false,
        });
        penilaianStore.createIndex("tahun", "tahun", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PENETAPAN)) {
        const penetapanStore = db.createObjectStore(STORES.PENETAPAN, {
          keyPath: "id",
          autoIncrement: true,
        });
        penetapanStore.createIndex("pegawai_id", "pegawai_id", {
          unique: false,
        });
        penetapanStore.createIndex("nomor_surat", "nomor_surat", {
          unique: false,
        });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
  });
}

async function getStore(
  storeName: string,
  mode: IDBTransactionMode = "readonly"
): Promise<IDBObjectStore> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

export async function addRecord<T>(
  storeName: string,
  data: Omit<T, "id">
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function updateRecord<T extends { id: number }>(
  storeName: string,
  data: T
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecord(
  storeName: string,
  key: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getRecord<T>(
  storeName: string,
  key: number
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result as T[]) || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.get(value);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve((request.result as T[]) || []);
    request.onerror = () => reject(request.error);
  });
}

export async function countRecords(storeName: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Typed helpers
export const DB = {
  addPegawai: (data: PegawaiInput) => addRecord<Pegawai>(STORES.PEGAWAI, data),
  updatePegawai: (data: Pegawai) => updateRecord(STORES.PEGAWAI, data),
  deletePegawai: (id: number) => deleteRecord(STORES.PEGAWAI, id),
  getPegawai: (id: number) => getRecord<Pegawai>(STORES.PEGAWAI, id),
  getAllPegawai: () => getAllRecords<Pegawai>(STORES.PEGAWAI),
  getPegawaiByNIP: (nip: string) =>
    getByIndex<Pegawai>(STORES.PEGAWAI, "nip", nip),
  countPegawai: () => countRecords(STORES.PEGAWAI),

  addPenilaian: (data: PenilaianInput) =>
    addRecord<Penilaian>(STORES.PENILAIAN, data),
  updatePenilaian: (data: Penilaian) =>
    updateRecord(STORES.PENILAIAN, data),
  deletePenilaian: (id: number) => deleteRecord(STORES.PENILAIAN, id),
  getPenilaian: (id: number) =>
    getRecord<Penilaian>(STORES.PENILAIAN, id),
  getAllPenilaian: () => getAllRecords<Penilaian>(STORES.PENILAIAN),
  getPenilaianByPegawai: (pegawaiId: number) =>
    getAllByIndex<Penilaian>(STORES.PENILAIAN, "pegawai_id", pegawaiId),
  countPenilaian: () => countRecords(STORES.PENILAIAN),

  addPenetapan: (data: PenetapanInput) =>
    addRecord<Penetapan>(STORES.PENETAPAN, data),
  updatePenetapan: (data: Penetapan) =>
    updateRecord(STORES.PENETAPAN, data),
  deletePenetapan: (id: number) => deleteRecord(STORES.PENETAPAN, id),
  getPenetapan: (id: number) =>
    getRecord<Penetapan>(STORES.PENETAPAN, id),
  getAllPenetapan: () => getAllRecords<Penetapan>(STORES.PENETAPAN),
  countPenetapan: () => countRecords(STORES.PENETAPAN),
} as const;
