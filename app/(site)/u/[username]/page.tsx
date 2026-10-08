'use client';

import React, { useState } from 'react';
import EdgeGlow from '@/components/ui/EdgeGlow';
import Button from '@/components/ui/Button';
import { getProfileByUsername, COMMUNITY_PROFILES, INITIAL_POSTS, UserProfile } from '@/lib/data/communityData';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import {
  UserPlus,
  Check,
  Github,
  Twitter,
  Globe,
  Layers,
  FolderGit2,
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function UserProfilePage({
  params,
  onNavigate,
}: {
  params: { username: string };
  onNavigate?: (path: string) => void;
}) {
  const profile = getProfileByUsername(params.username) || COMMUNITY_PROFILES[0];
  const { showToast } = useToast();

  const [connected, setConnected] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [searchJadaiId, setSearchJadaiId] = useState('');
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);

  const userPosts = INITIAL_POSTS.filter((p) => p.authorId === profile.id);

  const handleConnect = () => {
    StudioAudio.playSuccessArpeggio();
    setConnected(true);
    showToast(`Connection signal transmitted to ${profile.displayName}`, 'success');
  };

  const handleSearchJadaiId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchJadaiId.trim()) return;

    const matched = COMMUNITY_PROFILES.find(
      (p) => p.jadaiId.toLowerCase() === searchJadaiId.trim().toLowerCase()
    );

    if (matched) {
      StudioAudio.playSuccessArpeggio();
      setFoundUser(matched);
    } else {
      StudioAudio.playClick();
      showToast('No user found with that Jadai ID', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-[#c4c0bb]">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-[#C9A84C] shadow-lg"
          />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
                {profile.displayName}
              </h1>
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-[#e8c96a] font-bold">
                {profile.category}
              </span>
            </div>

            <p className="text-xs font-mono text-[#8a6e2a]">
              @{profile.username} • Jadai ID: <span className="text-[#f5f3f0] font-bold">{profile.jadaiId}</span>
            </p>

            <p className="text-xs text-[#c4c0bb] max-w-lg leading-relaxed pt-1">
              {profile.bio}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2 text-[#8a6e2a]">
              {profile.socialLinks.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.socialLinks.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {profile.socialLinks.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Connect Action & Search */}
        <div className="flex flex-col gap-2.5 shrink-0">
          <button
            onClick={handleConnect}
            disabled={connected}
            className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              connected
                ? 'bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-[#e8c96a]'
                : 'bg-[#C9A84C] text-[#050404] hover:bg-[#e8c96a]'
            }`}
          >
            {connected ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Connected in Mesh</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Request Connection</span>
              </>
            )}
          </button>

          <button
            onClick={() => setConnectModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-[rgba(201,168,76,0.25)] bg-[#050404] hover:border-[#C9A84C] text-xs font-mono text-[#c4c0bb] hover:text-[#f5f3f0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Search Jadai ID Handshake</span>
          </button>
        </div>
      </div>

      {/* Public Projects Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold text-[#f5f3f0] flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-[#C9A84C]" />
          <span>Public Featured Projects</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.publicProjects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors">
                  {p.title}
                </h4>
                <ExternalLink className="w-3.5 h-3.5 text-[#8a6e2a]" />
              </div>
              <p className="text-xs text-[#c4c0bb] font-mono leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Posts Stream */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold text-[#f5f3f0] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#C9A84C]" />
          <span>Recent Dispatches</span>
        </h3>

        <div className="space-y-3">
          {userPosts.length > 0 ? (
            userPosts.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#8a6e2a]">
                  <span>{p.createdAt}</span>
                  <span>{p.likes} likes</span>
                </div>
                <p className="text-xs sm:text-sm text-[#f5f3f0] leading-relaxed">{p.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs font-mono text-[#8a6e2a]">No recent public dispatches.</p>
          )}
        </div>
      </div>

      {/* Jadai ID Connect Handshake Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold">
                Jadai ID Network Handshake
              </span>
              <button
                onClick={() => {
                  setConnectModalOpen(false);
                  setFoundUser(null);
                }}
                className="text-xs font-mono text-[#8a6e2a] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                Connect via Studio ID
              </h4>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Enter a Jadai ID (e.g. JD-8491, JD-9214, JD-3108) to discover and handshake with other builders.
              </p>
            </div>

            <form onSubmit={handleSearchJadaiId} className="flex gap-2">
              <input
                type="text"
                value={searchJadaiId}
                onChange={(e) => setSearchJadaiId(e.target.value)}
                placeholder="e.g. JD-8491"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            {foundUser && (
              <div className="p-4 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.25)] space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={foundUser.avatar}
                    alt={foundUser.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"
                  />
                  <div>
                    <h5 className="font-display font-bold text-sm text-[#f5f3f0]">
                      {foundUser.displayName}
                    </h5>
                    <span className="text-[10px] font-mono text-[#8a6e2a]">
                      @{foundUser.username} • {foundUser.category}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConnectModalOpen(false);
                      onNavigate ? onNavigate(`/u/${foundUser.username}`) : (window.location.href = `/u/${foundUser.username}`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all"
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
