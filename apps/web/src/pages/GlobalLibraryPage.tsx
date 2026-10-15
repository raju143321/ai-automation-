import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, ExternalLink, Calendar, Award } from 'lucide-react';
import { api } from '../lib/api-client';
import { Source } from '@researchsphere/shared';

export const GlobalLibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: sources = [], isLoading } = useQuery<Source[]>({
    queryKey: ['global-sources'],
    queryFn: () => api.get<Source[]>('/projects/11111111-1111-1111-1111-111111111111/sources')
  });

  const filtered = sources.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.abstract && s.abstract.toLowerCase().includes(search.toLowerCase())) ||
    s.authors.some(a => a.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BookOpen size={22} className="text-cyan-400" />
          <span>Unified Research Library</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore and reference all saved literature, preprints, and citations across all your research projects.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter library by title, author, or keyword..."
          className="w-full bg-[#0e1422] border border-[#1e2a42] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-cyan-400 text-xs">Loading library...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
            <BookOpen size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No sources found in library</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                      {s.publisher || 'Scholarly Publication'}
                    </span>
                    {s.publication_date && (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                        <Calendar size={11} />
                        <span>{s.publication_date}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  {s.authors && s.authors.length > 0 && (
                    <p className="text-xs text-slate-300">By {s.authors.map(a => a.name).join(', ')}</p>
                  )}
                </div>

                {s.doi && (
                  <a
                    href={`https://doi.org/${s.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-[#151d2f] hover:bg-[#202b44] text-cyan-400 border border-[#232f48] text-xs font-mono flex items-center space-x-1 shrink-0"
                  >
                    <span>DOI: {s.doi}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {s.abstract && (
                <p className="text-xs text-slate-400 bg-[#090d16] p-3 rounded border border-[#151e30] line-clamp-3">
                  {s.abstract}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
