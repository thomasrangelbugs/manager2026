import { motion } from 'framer-motion';
import type { News } from '../types';

type Props = {
  news: News[];
  limit?: number;
};

const tone = {
  positive: 'border-emerald-400/25 bg-emerald-500/10',
  neutral: 'border-white/10 bg-white/[0.05]',
  warning: 'border-amber-400/25 bg-amber-500/10',
  danger: 'border-rose-400/25 bg-rose-500/10',
};

export const NewsFeed = ({ news, limit }: Props) => {
  const list = typeof limit === 'number' ? news.slice(0, limit) : news;

  return (
    <div className="space-y-3">
      {list.map((item) => (
        <motion.article
          key={item.id}
          layout
          className={`rounded-xl border p-4 ${tone[item.tone]}`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {new Date(item.date).toLocaleDateString('pt-BR')}
          </p>
          <h3 className="mt-1 break-words font-display text-lg font-black text-white sm:text-xl">{item.title}</h3>
          <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">{item.body}</p>
        </motion.article>
      ))}
    </div>
  );
};
