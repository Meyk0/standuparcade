import Link from "next/link";

export default function TeamNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-skin-accent">
          TEAM NOT FOUND
        </h1>
        <p className="text-skin-text-secondary text-sm sm:text-base">
          This team doesn&apos;t exist yet. Maybe the URL is wrong?
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-skin-button-bg text-skin-button-text rounded-lg hover:bg-skin-button-hover transition-colors font-bold text-sm"
        >
          CREATE A TEAM
        </Link>
      </div>
    </main>
  );
}
