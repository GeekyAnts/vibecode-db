export function GeekyAntsCTA() {
  return (
    <section className="bg-gradient-to-r from-[#000000] to-[#161616] py-10 px-8 rounded-xl shadow-2xl">
      <div className="text-left">
        <div className="flex items-center mb-6">
          <img
            alt="GeekyAnts Logo"
            width={140}
            height={32}
            className="h-8 w-auto"
            src="/geekyants-logo.svg"
          />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Looking to hire a development team?
        </h2>
        <p className="text-gray-300 text-lg md:text-xl mb-6">
          Work with our solutions partner - GeekyAnts, with 15+ years of experience and 600+ global clients.
        </p>
        <a
          href="https://geekyants.com/hire?utm_source=vibecode-db&utm_medium=referral&utm_campaign=cross-partnership"
          target="_blank"
          rel="noreferrer"
        >
          <button
            className="bg-white hover:bg-white/80 border border-gray-200 px-8 py-3 rounded-full text-base font-medium text-black h-auto cursor-pointer"
            type="button"
          >
            Book a Discovery Call
          </button>
        </a>
      </div>
    </section>
  )
}
