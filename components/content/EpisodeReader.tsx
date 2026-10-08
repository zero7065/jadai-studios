import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import ShareButtons from '../social/ShareButtons';
import type { BookOfLiesEpisode } from '../../lib/data/book-of-lies';
import { Heart, ArrowLeft, ArrowRight, BookOpen, Clock, PenTool, Check, Sparkles } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';
import { StudioAudio } from '../../lib/watermark';

export interface EpisodeReaderProps {
  episode: BookOfLiesEpisode;
  onBack: () => void;
  onNextEpisode?: () => void;
}

export const EpisodeReader: React.FC<EpisodeReaderProps> = ({
  episode,
  onBack,
  onNextEpisode,
}) => {
  if (!episode) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm font-mono text-[#8a6e2a]">No episode selected.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          Return to Canon
        </Button>
      </div>
    );
  }

  const [scrollProgress, setScrollProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(episode.likes_count || 0);
  const [userReflection, setUserReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editedStoryText, setEditedStoryText] = useState(episode.full_text || '');
  const [isRemixed, setIsRemixed] = useState(false);
  const { showToast } = useToast();

  const epNumber = episode.episode_number ?? 1;

  useEffect(() => {
    // Check if user has a personalized version of this episode
    try {
      const storedRemix = localStorage.getItem(`jadai_story_remix_${episode.slug}`);
      if (storedRemix) {
        setEditedStoryText(storedRemix);
        setIsRemixed(true);
      } else {
        setEditedStoryText(episode.full_text || '');
        setIsRemixed(false);
      }

      const stored = localStorage.getItem('jadai_reflections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[episode.slug]) {
          setUserReflection(parsed[episode.slug]);
        }
      }
    } catch {
      // Ignored
    }
  }, [episode.slug, episode.full_text]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress((currentProgress / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = async () => {
    if (liked) return;
    StudioAudio.playClick();
    setLiked(true);
    setLikesCount((prev) => prev + 1);

    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'book_of_lies',
          targetId: episode.id,
          action: 'like',
        }),
      });
      showToast('Transmission affirmed in Book of Lies register.', 'success');
    } catch {
      // Non-blocking
    }
  };

  const handleSaveReflection = () => {
    if (!userReflection.trim()) {
      showToast('Enter your reflection first.', 'error');
      return;
    }

    try {
      const stored = localStorage.getItem('jadai_reflections');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[episode.slug] = userReflection.trim();
      localStorage.setItem('jadai_reflections', JSON.stringify(parsed));
      StudioAudio.playSuccessArpeggio();
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 3000);
      showToast('Personal reflection inscribed in your private codex.', 'success');
    } catch {
      showToast('Failed to save reflection locally.', 'error');
    }
  };

  const handleSaveStoryRemix = () => {
    try {
      localStorage.setItem(`jadai_story_remix_${episode.slug}`, editedStoryText);
      setIsRemixed(true);
      setIsEditingStory(false);
      StudioAudio.playSuccessArpeggio();
      showToast('Custom story version saved. You now own this adaptation!', 'success');
    } catch {
      showToast('Failed to save story locally.', 'error');
    }
  };

  const handleResetToCanon = () => {
    try {
      localStorage.removeItem(`jadai_story_remix_${episode.slug}`);
      setEditedStoryText(episode.full_text || '');
      setIsRemixed(false);
      setIsEditingStory(false);
      StudioAudio.playClick();
      showToast('Reset to canonical manuscript.', 'info');
    } catch {
      // Ignored
    }
  };

  const handleOpenInWriterStudio = () => {
    try {
      // Pre-seed creative draft for Writing Studio
      const draftPayload = {
        title: `${episode.title} (Adaptation)`,
        genre: `${episode.sin_category} Parable`,
        content: editedStoryText,
        prompt: `Inspired by Book of Lies #${epNumber}: ${episode.title}`,
      };
      localStorage.setItem('jadai_creative_active_draft', JSON.stringify(draftPayload));
      StudioAudio.playSuccessArpeggio();
      showToast('Draft ported to Writing Studio. Launching...', 'success');
      window.location.href = '/playground/dream-forge';
    } catch {
      showToast('Unable to launch writer studio.', 'error');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-[#050404] z-50">
        <div
          className="h-full bg-gradient-to-r from-[#8a6e2a] via-[#C9A84C] to-[#e8c96a] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-[68ch] mx-auto space-y-8">
        {/* Back Button & Share */}
        <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.15)] pb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Canon</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingStory(!isEditingStory)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                isEditingStory
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : isRemixed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-amber-400/50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isEditingStory ? 'Close Story Editor' : isRemixed ? 'Edited (Custom Story)' : 'Personalize Story'}</span>
            </button>

            <ShareButtons
              title={`Book of Lies #${epNumber}: ${episode.title || ''}`}
              excerpt={episode.teaser || ''}
            />
          </div>
        </div>

        {/* Header Block */}
        <header className="space-y-4 pt-4 border-b border-[rgba(201,168,76,0.2)] pb-8">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#C9A84C] font-semibold tracking-widest">
              EPISODE #{String(epNumber).padStart(3, '0')}
            </span>
            <span className="text-[#4a4744]">•</span>
            <span className="text-[#8a6e2a]">ACT {episode.act || 1}</span>
            <span className="text-[#4a4744]">•</span>
            <span className="text-[#C0392B] uppercase tracking-wider">{episode.sin_category || 'Sin'}</span>
            {isRemixed && (
              <span className="ml-auto px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                Your Custom Adaptation
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#f5f3f0] leading-tight tracking-wide">
            {episode.title}
          </h1>

          <p className="text-base font-serif italic text-[#8a6e2a] leading-relaxed">
            "{episode.tagline}"
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8a6e2a] pt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
              Nightly Transmission • 9:47 PM WAT
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenInWriterStudio}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors text-[11px]"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Open in Writing Studio</span>
              </button>
            </div>
          </div>
        </header>

        {/* Story Text Area or Live Editor */}
        {isEditingStory ? (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-400 font-mono">
                  Personalize This Story's Words & Direction
                </h3>
                <p className="text-xs text-zinc-400">
                  You own your story. Adjust the dialogue, twist the ending, or rewrite it in your own voice.
                </p>
              </div>
              {isRemixed && (
                <button
                  onClick={handleResetToCanon}
                  className="text-xs text-rose-400 hover:underline font-mono"
                >
                  Reset to Original
                </button>
              )}
            </div>

            <textarea
              value={editedStoryText}
              onChange={(e) => setEditedStoryText(e.target.value)}
              className="w-full h-96 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-serif text-base leading-relaxed focus:outline-none focus:border-amber-400 resize-y"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-zinc-500">
                {editedStoryText.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setIsEditingStory(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveStoryRemix}>
                  Save My Version
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <article className="prose prose-invert max-w-none text-[#c4c0bb] font-serif text-lg leading-[1.8] space-y-6 select-text">
            {(editedStoryText || '').split('\n\n').map((paragraph, idx) => {
              if (idx === 0) {
                return (
                  <p key={idx} className="first-letter:text-5xl first-letter:font-display first-letter:text-[#C9A84C] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                    {paragraph}
                  </p>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </article>
        )}

        {/* User Story Reflection Section */}
        <div className="p-6 rounded-2xl bg-zinc-950/90 border border-amber-500/25 space-y-4 my-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 font-mono">
              <PenTool className="w-4 h-4 text-amber-500" />
              <span>Personal Reflection & Mirror Journal</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Personal Codex Entry</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            How does this parable's anatomy of the lie reflect in your current projects, architecture, or creative decisions? Your reflections synthesize into your personal exportable "Book of Lies".
          </p>
          <textarea
            value={userReflection}
            onChange={(e) => setUserReflection(e.target.value)}
            placeholder="Inscribe your honest reflection here..."
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 resize-none h-28"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-zinc-500 font-mono">
              {userReflection.length} characters
            </span>
            <Button
              size="sm"
              variant={reflectionSaved ? 'primary' : 'outline'}
              onClick={handleSaveReflection}
              className="gap-2"
            >
              {reflectionSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Inscribed
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Save Reflection
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="pt-8 border-t border-[rgba(201,168,76,0.2)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded border transition-all cursor-pointer ${
                liked
                  ? 'bg-[rgba(201,168,76,0.15)] border-[#C9A84C] text-[#e8c96a]'
                  : 'border-[rgba(201,168,76,0.25)] text-[#c4c0bb] hover:border-[#C9A84C]'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-[#C9A84C] text-[#C9A84C]' : ''}`} />
              <span className="text-xs font-mono">{likesCount} Liked</span>
            </button>

            <ShareButtons
              title={`Book of Lies #${epNumber}: ${episode.title || ''}`}
              excerpt={episode.teaser || ''}
            />
          </div>

          {/* Next Episode CTA */}
          {onNextEpisode && (
            <div className="p-6 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-[#8a6e2a] uppercase tracking-widest block">
                  Next in Transmission Order
                </span>
                <span className="text-sm font-display text-[#f5f3f0] font-semibold">
                  Advance to Next Episode
                </span>
              </div>
              <Button variant="primary" size="sm" onClick={onNextEpisode}>
                Next Episode
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default EpisodeReader;
