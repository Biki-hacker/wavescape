export function Footer() {
  return (
    <footer className="w-full py-6 px-8 mt-auto border-t-3 border-black bg-[var(--surface)]">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <p className="font-mono font-bold text-xs text-[var(--text)]">
          Data from OpenStreetMap, Open-Meteo, TimeAPI, WorldTimeAPI & Radio Browser
        </p>
        <p className="font-mono font-bold text-xs text-[var(--text)]">
          WaveScape v1.0.0
        </p>
      </div>
    </footer>
  )
}
