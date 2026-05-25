export function Footer() {
  return (
    <footer className="portal-footer shrink-0">
      <div className="portal-footer-accent" aria-hidden />
      <div className="px-4 py-3 text-center text-sm text-white">
        <p>© {new Date().getFullYear()} Hijra Bank — Self Service ERP Admin</p>
        <p className="mt-1 text-xs text-white/75">Enterprise datastore · Portal API ready</p>
      </div>
    </footer>
  )
}
