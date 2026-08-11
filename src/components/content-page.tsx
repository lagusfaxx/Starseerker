import type { ContentPage } from "@/lib/content";

export function ContentArticle({ page }: { page: ContentPage }) {
  return (
    <article className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="display text-3xl sm:text-4xl">{page.title}</h1>
        <p className="mt-3 text-sm text-mute">{page.summary}</p>

        <div className="mt-10 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-bone/80">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
