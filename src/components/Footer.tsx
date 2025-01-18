export function Footer() {
  return (
    <footer className="mt-auto py-6 bg-background border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Anime Love Factory. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by MyAnimeList API
          </p>
        </div>
      </div>
    </footer>
  );
}