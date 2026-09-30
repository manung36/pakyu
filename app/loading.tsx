export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-orange-600" />
      <p className="text-sm font-medium">Memuat aplikasi...</p>
    </div>
  );
}
