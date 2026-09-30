"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Calculator,
  FileText,
  GraduationCap,
  FileSpreadsheet,
  UserCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DB } from "@/lib/db";
import { Pegawai } from "@/lib/constants";

const jabatanOrder = ["Asisten Ahli", "Lektor", "Lektor Kepala", "Profesor"];
const jabatanColors = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-red-500",
];

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDosen: 0,
    totalPenilaian: 0,
    totalPenetapan: 0,
    totalJabatan: 0,
  });
  const [jabatanCount, setJabatanCount] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadStats() {
      try {
        const [totalDosen, totalPenilaian, totalPenetapan, allDosen] =
          await Promise.all([
            DB.countPegawai(),
            DB.countPenilaian(),
            DB.countPenetapan(),
            DB.getAllPegawai(),
          ]);

        const counts: Record<string, number> = {};
        allDosen.forEach((p: Pegawai) => {
          counts[p.jabatan_fungsional] = (counts[p.jabatan_fungsional] || 0) + 1;
        });

        setStats({
          totalDosen,
          totalPenilaian,
          totalPenetapan,
          totalJabatan: Object.keys(counts).length,
        });
        setJabatanCount(counts);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      label: "Total Dosen",
      value: stats.totalDosen,
      sub: "Data master terdaftar",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Penilaian AK",
      value: stats.totalPenilaian,
      sub: "Rekaman konversi",
      icon: Calculator,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Penetapan PAK",
      value: stats.totalPenetapan,
      sub: "Dokumen dibuat",
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Jabatan",
      value: stats.totalJabatan,
      sub: "Kategori jabatan fungsional",
      icon: GraduationCap,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan data PAK Konversi Dosen
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.sub}
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-lg", card.bg)}>
                    <card.icon className={cn("h-6 w-6", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jabatan Fungsional</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-5">
                {jabatanOrder.map((jab) => (
                  <div key={jab} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : stats.totalDosen > 0 ? (
              <div className="space-y-5">
                {jabatanOrder.map((jab, i) => {
                  const count = jabatanCount[jab] || 0;
                  const pct =
                    stats.totalDosen > 0
                      ? (count / stats.totalDosen) * 100
                      : 0;
                  return (
                    <div key={jab} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{jab}</span>
                        <span className="font-medium text-muted-foreground">
                          {count} dosen
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada data dosen</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => router.push("/import")}
              >
                <FileSpreadsheet className="h-6 w-6 text-orange-600" />
                <span>Import Excel</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => router.push("/dosen")}
              >
                <UserCircle className="h-6 w-6 text-orange-600" />
                <span>Data Dosen</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => router.push("/penilaian")}
              >
                <Calculator className="h-6 w-6 text-orange-600" />
                <span>Penilaian AK</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => router.push("/dokumen")}
              >
                <FileText className="h-6 w-6 text-orange-600" />
                <span>Buat Dokumen</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
