"use server";

import { revalidatePath } from "next/cache";
import {
  Pegawai,
  PegawaiInput,
  Penilaian,
  PenilaianInput,
  Penetapan,
  PenetapanInput,
  Pejabat,
} from "@/lib/constants";
import * as DB from "@/lib/db";

// Pegawai actions
export async function getAllPegawaiAction(): Promise<Pegawai[]> {
  return DB.getAllPegawai();
}

export async function getPegawaiAction(id: number): Promise<Pegawai | undefined> {
  return DB.getPegawai(id);
}

export async function getPegawaiByNIPAction(nip: string): Promise<Pegawai | undefined> {
  return DB.getPegawaiByNIP(nip);
}

export async function addPegawaiAction(data: PegawaiInput): Promise<number> {
  const id = await DB.addPegawai(data);
  revalidatePath("/dosen");
  revalidatePath("/dashboard");
  return id;
}

export async function updatePegawaiAction(data: Pegawai): Promise<number> {
  const id = await DB.updatePegawai(data);
  revalidatePath("/dosen");
  revalidatePath("/dashboard");
  revalidatePath("/penilaian");
  revalidatePath("/dokumen");
  return id;
}

export async function deletePegawaiAction(id: number): Promise<void> {
  await DB.deletePegawai(id);
  revalidatePath("/dosen");
  revalidatePath("/dashboard");
  revalidatePath("/penilaian");
  revalidatePath("/dokumen");
}

export async function countPegawaiAction(): Promise<number> {
  return DB.countPegawai();
}

// Penilaian actions
export async function getAllPenilaianAction(): Promise<Penilaian[]> {
  return DB.getAllPenilaian();
}

export async function getPenilaianByPegawaiAction(pegawaiId: number): Promise<Penilaian[]> {
  return DB.getPenilaianByPegawai(pegawaiId);
}

export async function addPenilaianAction(data: PenilaianInput): Promise<number> {
  const id = await DB.addPenilaian(data);
  revalidatePath("/penilaian");
  revalidatePath("/dashboard");
  return id;
}

export async function updatePenilaianAction(data: Penilaian): Promise<number> {
  const id = await DB.updatePenilaian(data);
  revalidatePath("/penilaian");
  revalidatePath("/dashboard");
  return id;
}

export async function deletePenilaianAction(id: number): Promise<void> {
  await DB.deletePenilaian(id);
  revalidatePath("/penilaian");
  revalidatePath("/dashboard");
  revalidatePath("/dokumen");
}

export async function countPenilaianAction(): Promise<number> {
  return DB.countPenilaian();
}

// Penetapan actions
export async function getAllPenetapanAction(): Promise<Penetapan[]> {
  return DB.getAllPenetapan();
}

export async function addPenetapanAction(data: PenetapanInput): Promise<number> {
  const id = await DB.addPenetapan(data);
  revalidatePath("/dokumen");
  revalidatePath("/dashboard");
  return id;
}

export async function countPenetapanAction(): Promise<number> {
  return DB.countPenetapan();
}

// Pejabat actions
export async function getAllPejabatAction(): Promise<Pejabat[]> {
  return DB.getAllPejabat();
}

export async function addPejabatAction(data: Omit<Pejabat, "id">): Promise<number> {
  const id = await DB.addPejabat(data);
  return id;
}
