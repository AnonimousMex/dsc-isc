import { Link } from 'react-router-dom';
import { resizeImageUrl, type News } from '@dsc-isc/shared';

interface NewsCardProps {
  news: News;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      to={`/noticias/${news.slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-elevated">
        {news.coverImage && (
          <img
            src={resizeImageUrl(news.coverImage.url, 600)}
            alt={news.coverImage.alt ?? news.title}
            width={600}
            height={338}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-5">
        <h2 className="text-lg font-bold text-ink group-hover:text-primary">{news.title}</h2>
        <p className="mt-2 text-sm text-muted">{news.excerpt}</p>
      </div>
    </Link>
  );
}
