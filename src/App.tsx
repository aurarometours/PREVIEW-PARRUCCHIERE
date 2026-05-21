import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Menu, Phone, Play, Scissors, Sparkles, X } from 'lucide-react';

const BG_VIDEO = '/videos/linerudy-hero-hair-atelier.mp4';
const HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2200&auto=format&fit=crop';

type BoomerangVideoBgProps = {
  src: string;
  className?: string;
};

function BoomerangVideoBg({ src, className }: BoomerangVideoBgProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [framesReady, setFramesReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    const frames: HTMLCanvasElement[] = [];
    let capturing = true;
    let lastTime = -1;
    const MAX_WIDTH = 960;

    const captureFrame = () => {
      if (!capturing || video.readyState < 2) return;
      if (video.currentTime === lastTime) return;
      lastTime = video.currentTime;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      const scale = Math.min(1, MAX_WIDTH / vw);
      const w = Math.round(vw * scale);
      const h = Math.round(vh * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      frames.push(canvas);
    };

    type VFCVideo = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };

    const vfcVideo = video as VFCVideo;
    const hasVFC = typeof vfcVideo.requestVideoFrameCallback === 'function';
    let rafId = 0;

    const rafLoop = () => {
      captureFrame();
      if (capturing) rafId = requestAnimationFrame(rafLoop);
    };

    const vfcLoop = () => {
      captureFrame();
      if (capturing && vfcVideo.requestVideoFrameCallback) {
        vfcVideo.requestVideoFrameCallback(vfcLoop);
      }
    };

    const onEnded = () => {
      capturing = false;
      if (frames.length > 0) {
        framesRef.current = frames;
        setFramesReady(true);
      }
    };

    const onLoaded = () => {
      video.play().catch(() => undefined);
      if (hasVFC) vfcVideo.requestVideoFrameCallback?.(vfcLoop);
      else rafId = requestAnimationFrame(rafLoop);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) onLoaded();

    return () => {
      capturing = false;
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('ended', onEnded);
    };
  }, [src, videoFailed]);

  useEffect(() => {
    if (!framesReady) return;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const frames = framesRef.current;
    if (frames.length === 0) return;

    const first = frames[0];
    canvas.width = first.width;
    canvas.height = first.height;

    let index = 0;
    let direction = 1;
    let last = performance.now();
    const interval = 1000 / 30;
    let rafId = 0;

    const render = (now: number) => {
      if (now - last >= interval) {
        last = now;
        ctx.drawImage(frames[index], 0, 0);
        index += direction;
        if (index >= frames.length - 1) {
          index = frames.length - 1;
          direction = -1;
        } else if (index <= 0) {
          index = 0;
          direction = 1;
        }
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [framesReady]);

  return (
    <div className={className ?? 'absolute inset-0 h-full w-full'}>
      {videoFailed && (
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_FALLBACK_IMAGE})` }}
        />
      )}
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full scale-[1.02] object-cover"
        style={{ display: framesReady || videoFailed ? 'none' : 'block' }}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onError={() => setVideoFailed(true)}
      />
      <canvas
        ref={displayCanvasRef}
        className="h-full w-full scale-[1.02] object-cover"
        style={{ display: framesReady && !videoFailed ? 'block' : 'none' }}
      />
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = useMemo(
    () => [
      { href: '#atelier', label: 'Atelier' },
      { href: '#metodo', label: 'Metodo' },
      { href: '#prenota', label: 'Prenota' },
    ],
    []
  );

  return (
    <main id="top" className="min-h-screen bg-[#ece8dd] text-[#1f2a1d] antialiased selection:bg-[#85AB8B]/40 selection:text-[#1f2a1d]">
      <section className="relative min-h-screen w-full overflow-hidden sm:h-screen">
        <BoomerangVideoBg src={BG_VIDEO} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_32%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(236,232,221,0.05)_0%,rgba(236,232,221,0.18)_34%,rgba(236,232,221,0.76)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(236,232,221,0.74)_0%,rgba(236,232,221,0.31)_38%,rgba(236,232,221,0.08)_58%,rgba(236,232,221,0.58)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-soft-light [background-image:radial-gradient(circle_at_1px_1px,#1f2a1d_1px,transparent_0)] [background-size:18px_18px]" />

        <nav className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6 md:px-10">
          <a href="#top" className="flex items-center gap-2 text-[#1f2a1d]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2a1d] text-sm font-semibold text-[#f4efe4] shadow-sm">LR</span>
            <span className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">LineRudy</span>
          </a>

          <div className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/70 py-1 pl-6 pr-1 shadow-sm backdrop-blur-md lg:flex">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm transition-colors ${i === 0 ? 'font-semibold text-[#1f2a1d]' : 'font-medium text-[#4b5b47] hover:text-[#1f2a1d]'}`}
              >
                {link.label}
              </a>
            ))}
            <a href="tel:0644249727" className="ml-2 rounded-full bg-[#1f2a1d] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a3827]">
              Prenota
            </a>
          </div>

          <div className="flex items-center gap-3 text-[#2d3a2a] sm:gap-6">
            <a href="tel:0644249727" className="hidden items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80 sm:flex">
              <Phone className="h-4 w-4" />
              Chiama
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=LineRudy+Hairstyle+Via+Nomentana+211+Roma"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80 sm:flex"
            >
              <MapPin className="h-4 w-4" />
              Roma
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-[#1f2a1d] backdrop-blur-md transition-all duration-300 hover:bg-white/90 lg:hidden"
              aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={menuOpen}
            >
              <Menu className={`absolute h-5 w-5 transition-all duration-300 ${menuOpen ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
              <X className={`absolute h-5 w-5 transition-all duration-300 ${menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'}`} />
            </button>
          </div>
        </nav>

        <div className={`fixed inset-0 z-20 transition-opacity duration-300 lg:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm" />
        </div>

        <div className={`fixed bottom-0 right-0 top-0 z-20 w-[85%] max-w-sm bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full flex-col px-8 pb-8 pt-24">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b border-[#1f2a1d]/10 py-4 text-2xl font-semibold text-[#1f2a1d] transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`} style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}>
              <a href="tel:0644249727" className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a]"><Phone className="h-4 w-4" />Chiama 06 4424 9727</a>
              <a href="https://www.google.com/maps/search/?api=1&query=LineRudy+Hairstyle+Via+Nomentana+211+Roma" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a]"><MapPin className="h-4 w-4" />Via Nomentana 211</a>
              <a href="tel:0644249727" className="mt-2 rounded-full bg-[#1f2a1d] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2a3827]">Prenota</a>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 pt-24 text-center sm:px-6 sm:pt-28 md:pt-32">
          <p className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3d5638] backdrop-blur-md transition-all duration-700 ${ready ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Atelier capelli · Roma
          </p>
          <h1
            className={`max-w-6xl text-[2.35rem] font-normal leading-[0.92] tracking-[-0.055em] text-[#336443] transition-all delay-100 duration-700 sm:text-5xl md:text-6xl lg:text-[5.8rem] xl:text-[6.85rem] ${ready ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-5 opacity-0 blur-sm'}`}
          >
            Il tuo taglio non deve farsi notare.{' '}
            <span className="text-[#85AB8B]">
              Deve farti
              <br className="hidden sm:block" /> riconoscere.
            </span>
          </h1>
          <p className={`mt-6 max-w-md px-2 text-sm leading-relaxed text-[#4b5b47] transition-all delay-200 duration-700 sm:mt-8 sm:text-base md:text-lg ${ready ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Taglio, colore e luce studiati per valorizzare lineamenti, stile e presenza. LineRudy Hairstyle, Via Nomentana 211.
          </p>
        </div>

        <div className={`absolute bottom-6 left-4 right-4 z-10 max-w-sm transition-all delay-300 duration-700 sm:bottom-8 sm:left-6 sm:right-auto md:bottom-10 md:left-10 ${ready ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <div className="mb-3 flex items-center gap-2 text-[#3d5638] sm:text-white/95">
            <Scissors className="h-4 w-4" />
            <span className="text-sm font-semibold sm:font-medium">Metodo LineRudy</span>
          </div>
          <p className="mb-6 max-w-xs text-xs font-medium leading-relaxed text-[#3d5638]/90 sm:font-normal sm:text-white/85">
            Un metodo essenziale: capire il volto, scegliere la linea, calibrare la luce, rendere il risultato facile da portare ogni giorno.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:0644249727" className="rounded-full bg-[#3d5638] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2d4228] sm:bg-white sm:px-6 sm:py-3 sm:text-[#1f2a1d] sm:hover:bg-white/90">Prenota ora</a>
            <a href="#atelier" className="text-sm font-semibold text-[#3d5638] transition-opacity hover:opacity-80 sm:font-medium sm:text-white">Scopri il metodo.</a>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 z-10 hidden items-center gap-2 text-sm text-white/90 sm:flex md:bottom-10 md:right-10">
          <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"><Play className="ml-0.5 h-3 w-3 fill-white text-white" /></button>
          <span className="font-medium">Il salone</span><span className="text-white/60">0:45</span>
        </div>
      </section>

      <section id="atelier" className="bg-[#ece8dd] px-4 py-24 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div><p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#85AB8B]">Il metodo</p><h2 className="text-5xl font-normal leading-[0.9] tracking-[-0.055em] text-[#336443] sm:text-6xl md:text-7xl">Il taglio giusto non cambia solo i capelli.</h2></div>
          <p className="max-w-xl text-base leading-8 text-[#4b5b47] md:text-lg">Cambia il modo in cui il volto viene letto. Per questo ogni servizio parte da consulenza, proporzione, tono, luce e mantenibilità reale del risultato.</p>
        </div>
      </section>

      <section id="metodo" className="bg-[#f4efe4] px-4 py-24 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            ['01', 'Consulenza', 'Ascolto dello stile, delle abitudini e della storia del capello prima di scegliere la direzione.'],
            ['02', 'Linea', 'Taglio e forma progettati sui lineamenti, non su una moda generica.'],
            ['03', 'Luce', 'Colore, riflessi ed effetti luce calibrati per dare profondità senza artificio.'],
          ].map(([n, title, text]) => (
            <article key={n} className="rounded-[2rem] border border-[#1f2a1d]/10 bg-white/55 p-7 shadow-sm backdrop-blur-sm">
              <p className="mb-14 text-xs font-semibold tracking-[0.24em] text-[#85AB8B]">{n}</p>
              <h3 className="mb-4 text-3xl font-normal tracking-[-0.04em] text-[#336443]">{title}</h3>
              <p className="text-sm leading-7 text-[#4b5b47]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="prenota" className="bg-[#ece8dd] px-4 py-24 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[2.5rem] bg-[#1f2a1d] p-8 text-[#f4efe4] shadow-2xl md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#85AB8B]">Prenotazioni</p>
            <h2 className="text-5xl font-normal leading-[0.88] tracking-[-0.055em] sm:text-6xl md:text-7xl">Prenota il tuo momento in salone.</h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/75 md:text-base">Per taglio, colore, effetti luce e trattamenti tecnici è consigliato chiamare: il salone potrà valutare tempi e percorso più adatto.</p>
          </div>
          <div className="rounded-[2rem] bg-white/95 p-6 text-[#1f2a1d]">
            <h3 className="mb-5 text-3xl font-normal tracking-[-0.04em] text-[#336443]">LineRudy Hairstyle</h3>
            <a href="tel:0644249727" className="flex justify-between gap-4 border-b border-[#1f2a1d]/10 py-4 text-sm font-semibold"><span>Telefono</span><span>06 4424 9727</span></a>
            <a href="https://www.google.com/maps/search/?api=1&query=LineRudy+Hairstyle+Via+Nomentana+211+Roma" target="_blank" rel="noreferrer" className="flex justify-between gap-4 border-b border-[#1f2a1d]/10 py-4 text-sm font-semibold"><span>Indirizzo</span><span className="text-right">Via Nomentana 211<br />Roma</span></a>
            <div className="flex justify-between gap-4 py-4 text-sm font-semibold"><span>Orari</span><span className="text-right">Mar–Sab<br />09:00–19:00</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
