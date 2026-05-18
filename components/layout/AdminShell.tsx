import { BrandLogo } from "./BrandLogo";
import { PageBackground } from "./PageBackground";

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <PageBackground>
      <header className="border-b border-neon-green/20 bg-black/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <BrandLogo href="/admin" priority />
          {title && (
            <p className="section-tag hidden sm:block">[ {title} ]</p>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </PageBackground>
  );
}
