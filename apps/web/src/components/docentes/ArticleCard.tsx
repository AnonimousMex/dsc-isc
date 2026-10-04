import { ExternalLink, Quote, Unlock } from 'lucide-react';
import type { TeacherArticle } from '@dsc-isc/shared';

interface ArticleCardProps {
  article: TeacherArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-lg border border-line bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-ink group-hover:text-primary">{article.title}</h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-primary" aria-hidden="true" />
      </div>

      <p className="mt-1.5 text-xs text-muted">{[article.year, article.venue].filter(Boolean).join(' · ')}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted">
        {article.citedByCount > 0 && (
          <span className="flex items-center gap-1">
            <Quote className="h-3 w-3" aria-hidden="true" />
            {article.citedByCount} {article.citedByCount === 1 ? 'cita' : 'citas'}
          </span>
        )}
        {article.isOpenAccess && (
          <span className="flex items-center gap-1 text-primary">
            <Unlock className="h-3 w-3" aria-hidden="true" />
            Acceso abierto
          </span>
        )}
      </div>
    </a>
  );
}
