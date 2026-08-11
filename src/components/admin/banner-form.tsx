'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { type AdminState, saveBanner } from '@/app/actions/admin';
import {
  type BannerPlacement,
  type HeroImageMode,
  type HeroOverlay,
  IMAGE_MODES,
  isSplitMode,
  OVERLAYS,
  OVERLAY_CLASS,
  PLACEMENTS,
  toBannerVideo,
  toImageMode,
  toOverlay,
  toPlacement,
  bannerTextClasses,
} from '@/lib/banner-style';
import { BannerVideo } from '@/components/banner-video';
import { ImageField } from './image-field';
import { VideoField } from './video-field';

const initialState: AdminState = { status: 'idle', message: '', errors: {} };

/** Fondos preparados, para no pedirle CSS al propietario. */
const BACKGROUNDS = [
  { label: 'Negro', value: 'linear-gradient(120deg, #000000 0%, #141416 60%, #262629 100%)' },
  { label: 'Grafito', value: 'linear-gradient(120deg, #0A0A0B 0%, #1B1B1E 55%, #303035 100%)' },
  { label: 'Humo', value: 'linear-gradient(120deg, #17171A 0%, #2C2C31 55%, #45454B 100%)' },
  { label: 'Plata', value: 'linear-gradient(120deg, #2C2C31 0%, #4A4A51 55%, #6E6E76 100%)' },
  { label: 'Claro', value: 'linear-gradient(120deg, #8F8F96 0%, #C9C9CC 55%, #F4F4F4 100%)' },
  { label: 'Blanco', value: '#FFFFFF' },
];

export type BannerFormValues = {
  id: string;
  placement: string;
  video: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  subtitleBold: boolean;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageMode: string;
  overlay: string;
  background: string;
  position: number;
  active: boolean;
};

export function BannerForm({ values }: { values: BannerFormValues }) {
  const [state, formAction] = useActionState(saveBanner, initialState);
  const [background, setBackground] = useState(values.background || BACKGROUNDS[0]!.value);
  const [eyebrow, setEyebrow] = useState(values.eyebrow);
  const [title, setTitle] = useState(values.title);
  const [subtitle, setSubtitle] = useState(values.subtitle);
  const [subtitleBold, setSubtitleBold] = useState(values.subtitleBold);
  const [ctaLabel, setCtaLabel] = useState(values.ctaLabel);
  const [image, setImage] = useState(values.image);
  const [imageMode, setImageMode] = useState<HeroImageMode>(toImageMode(values.imageMode));
  const [overlay, setOverlay] = useState<HeroOverlay>(toOverlay(values.overlay));
  const [placement, setPlacement] = useState<BannerPlacement>(toPlacement(values.placement));
  const [video, setVideo] = useState(values.video);
  const previewVideo = toBannerVideo(video);
  // La vista previa tiene que mostrar el mismo cambio de color que la portada:
  // si no, elegir un fondo claro se ve bien aqui y mal en la tienda.
  const tono = bannerTextClasses(
    background,
    !isSplitMode(imageMode) && Boolean(previewVideo || (image && imageMode === 'background')),
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {values.id ? <input type="hidden" name="bannerId" value={values.id} /> : null}
      <input type="hidden" name="placement" value={placement} />
      <input type="hidden" name="background" value={background} />
      <input type="hidden" name="imageMode" value={imageMode} />
      <input type="hidden" name="overlay" value={overlay} />

      {state.message ? (
        <p
          role="status"
          className={`border px-4 py-3 text-sm ${
            state.status === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <section className="border border-sand-dark bg-black">
        <h2 className="border-b border-sand-dark px-6 py-4 font-display text-base font-bold uppercase tracking-tight">
          Donde se muestra
        </h2>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {PLACEMENTS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer gap-3 border-2 p-3 transition-colors ${
                placement === option.value
                  ? 'border-ink bg-sand/40'
                  : 'border-sand-dark hover:border-ink-soft'
              }`}
            >
              <input
                type="radio"
                name="placementChoice"
                value={option.value}
                checked={placement === option.value}
                onChange={() => setPlacement(option.value)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#FFFFFF]"
              />
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="border border-sand-dark bg-black">
        <h2 className="border-b border-sand-dark px-6 py-4 font-display text-base font-bold uppercase tracking-tight">
          Vista previa
        </h2>
        <div
          className="relative flex min-h-64 items-center overflow-hidden px-8 py-10"
          style={{ background }}
        >
          {(previewVideo || image) && isSplitMode(imageMode) ? (
            // Mitad y mitad: la foto llena media vista previa, igual que en la
            // portada, para que se vea donde queda el corte.
            <div
              className={`absolute inset-y-0 w-1/2 ${
                imageMode === 'splitLeft' ? 'left-0' : 'right-0'
              }`}
            >
              {previewVideo ? (
                <BannerVideo video={previewVideo} poster={image} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover object-center" />
              )}
            </div>
          ) : null}
          {!isSplitMode(imageMode) && (previewVideo || (image && imageMode === 'background')) ? (
            <div className="absolute inset-0">
              {previewVideo ? (
                <BannerVideo video={previewVideo} poster={image} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover object-center" />
              )}
              <div className={`absolute inset-0 ${OVERLAY_CLASS[overlay]}`} />
            </div>
          ) : null}
          <div
            className={`relative z-10 max-w-lg ${
              isSplitMode(imageMode) ? (imageMode === 'splitLeft' ? 'ml-auto w-1/2 pl-4' : 'w-1/2 pr-4') : ''
            }`}
          >
            {eyebrow ? (
              <p className={`font-display text-xs font-bold uppercase tracking-[0.28em] ${tono.eyebrow}`}>
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <p
                className={`mt-2 font-display text-4xl font-bold uppercase leading-none tracking-tight ${tono.title}`}
              >
                {title}
              </p>
            ) : null}
            {subtitle ? (
              <p className={`mt-3 text-sm ${subtitleBold ? tono.subtitleBold : tono.subtitle}`}>
                {subtitle}
              </p>
            ) : null}
            {ctaLabel ? (
              <span className={`mt-5 inline-block ${tono.cta} px-6 py-3 text-xs`}>{ctaLabel}</span>
            ) : null}
          </div>
          {image && imageMode === 'side' ? (
            <div className="absolute right-8 top-1/2 hidden aspect-square h-[80%] -translate-y-1/2 items-center justify-center rounded-full bg-sand/95 p-6 sm:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-contain" />
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="border border-sand-dark bg-black">
          <h2 className="border-b border-sand-dark px-6 py-4 font-display text-base font-bold uppercase tracking-tight">
            Contenido
          </h2>
          <div className="space-y-5 p-6">
            <Field
              label="Texto pequeno superior"
              name="eyebrow"
              value={eyebrow}
              onChange={(event) => setEyebrow(event.target.value)}
              placeholder="Nuevo"
              error={state.errors.eyebrow}
            />
            <Field
              label="Titular"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Prestina"
              error={state.errors.title}
            />
            <div>
              <label className="label" htmlFor="banner-subtitle">
                Bajada
              </label>
              <textarea
                id="banner-subtitle"
                name="subtitle"
                rows={2}
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                maxLength={200}
                className="field"
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="subtitleBold"
                  checked={subtitleBold}
                  onChange={(event) => setSubtitleBold(event.target.checked)}
                  className="h-4 w-4 accent-[#FFFFFF]"
                />
                Bajada en negrita
              </label>
              <span className="mt-1 block text-xs text-ink-muted">
                Marcala si la bajada se lee poco sobre la foto: queda en negrita y en blanco
                puro. El titular no cambia.
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Texto del boton"
                name="ctaLabel"
                value={ctaLabel}
                onChange={(event) => setCtaLabel(event.target.value)}
                placeholder="Comprar ahora"
                error={state.errors.ctaLabel}
              />
              <Field
                label="Destino del boton"
                name="ctaHref"
                defaultValue={values.ctaHref}
                placeholder="/products/prestina"
                error={state.errors.ctaHref}
                hint="Ruta interna o URL completa."
              />
            </div>

            <ImageField
              name="image"
              label="Imagen del banner"
              defaultValue={values.image}
              aspect="wide"
              onChange={setImage}
              hint="Para fondo completo conviene una foto apaisada de al menos 1920x900. Si ademas pones un video de YouTube, esta imagen es la que se ve mientras arranca."
            />

            <VideoField
              label="Video de fondo"
              name="video"
              defaultValue={values.video}
              onChange={setVideo}
              error={state.errors.video}
              hint="Se reproduce solo, en bucle y sin sonido. Si lo completas, tapa a la imagen, que queda como cartel mientras el video arranca. Sube un .mp4 o .webm y no habra ningun control a la vista: los dibuja el navegador solo si se le piden. Con un enlace de YouTube o Vimeo manda su reproductor, y aunque se le pide que no muestre nada, conviene dejar puesta la imagen del banner."
            />
            {video && !previewVideo ? (
              <span className="error-text -mt-3 block">
                No se reconoce ese enlace. Sube un archivo .mp4 o .webm, o pega un enlace de
                YouTube o Vimeo.
              </span>
            ) : null}

            <fieldset>
              <legend className="label">Como se ve la imagen</legend>
              <div className="mt-2 space-y-2">
                {IMAGE_MODES.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer gap-3 border-2 p-3 transition-colors ${
                      imageMode === option.value
                        ? 'border-ink bg-sand/40'
                        : 'border-sand-dark hover:border-ink-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name="imageModeChoice"
                      value={option.value}
                      checked={imageMode === option.value}
                      onChange={() => setImageMode(option.value)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#FFFFFF]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {imageMode === 'background' ? (
              <div>
                <span className="label">Oscurecer la foto</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {OVERLAYS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOverlay(option.value)}
                      className={`border-2 px-4 py-2 text-sm transition-colors ${
                        overlay === option.value
                          ? 'border-ink bg-ink text-black'
                          : 'border-sand-dark hover:border-ink-soft'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <span className="mt-1.5 block text-xs text-ink-muted">
                  El titular va en blanco: si la foto es clara, sube el velo para que se lea.
                </span>
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="border border-sand-dark bg-black">
            <h2 className="border-b border-sand-dark px-6 py-4 font-display text-base font-bold uppercase tracking-tight">
              Fondo
            </h2>
            <div className="space-y-2 p-6">
              <p className="pb-1 text-xs text-ink-muted">
                {imageMode === 'background' && image
                  ? 'Se ve solo mientras carga la foto.'
                  : 'Color detras del texto.'}
              </p>
              {BACKGROUNDS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBackground(option.value)}
                  className={`flex w-full items-center gap-3 border-2 p-2 text-left transition-colors ${
                    background === option.value ? 'border-ink' : 'border-transparent hover:border-sand-dark'
                  }`}
                >
                  <span className="h-8 w-16 shrink-0" style={{ background: option.value }} />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="border border-sand-dark bg-black">
            <h2 className="border-b border-sand-dark px-6 py-4 font-display text-base font-bold uppercase tracking-tight">
              Visibilidad
            </h2>
            <div className="space-y-5 p-6">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={values.active}
                  className="h-4 w-4 accent-[#FFFFFF]"
                />
                Mostrar en la portada
              </label>
              <Field
                label="Orden"
                name="position"
                type="number"
                min="0"
                defaultValue={String(values.position)}
                error={state.errors.position}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-sand-dark bg-black px-6 py-4">
        <SubmitButton isNew={!values.id} />
      </div>
    </form>
  );
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Guardando...' : isNew ? 'Crear banner' : 'Guardar cambios'}
    </button>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  type = 'text',
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `banner-${name}`;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={`field ${error ? 'field-error' : ''}`}
        {...rest}
      />
      {error ? <span className="error-text">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-ink-muted">{hint}</span> : null}
    </div>
  );
}
