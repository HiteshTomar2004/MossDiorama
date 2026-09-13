/**
 * Music and Spotify Data
 * Curated ambient soundtrack and Spotify embeds for the portfolio.
 */

export const CURATED_TRACKS = [
  {
    id: 'droopy-ricochet',
    title: 'Droopy Likes Ricochet',
    artist: 'C418',
    album: 'Life Changing Moments Seem Minor in Pictures',
    src: '/assets/audio/droopy_ricochet_ambient.mp3',
    duration: 136, // ~2m 16s
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=320&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/artist/4uGBl6v396wY7657LScVdF',
    spotifyTrackId: '57bgtoPSgt236HzfBOd8kj',
  },
  {
    id: 'droopy-piano',
    title: 'Contemplative Piano (Subwoofer Lullaby Homage)',
    artist: 'C418',
    album: 'Minecraft - Volume Alpha',
    src: '/assets/audio/droopy_piano_ambient.mp3',
    duration: 124, // ~2m 04s
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=320&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/album/3Gt7rOjcMoEQEbyfn24fXM',
    spotifyTrackId: '6NG4b7eN2c7eHwO7J1tHnJ',
  },
  {
    id: 'droopy-ambient',
    title: 'Hearthside Atmosphere',
    artist: 'C418 & Forest Soundscapes',
    album: 'Wayfinder Chronicles',
    src: '/assets/audio/droopy_ambient.mp3',
    duration: 135, // ~2m 15s
    cover: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=320&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/artist/4uGBl6v396wY7657LScVdF',
    spotifyTrackId: '1y4bU23R5xO3zK1tP1eW',
  },
]

export const SPOTIFY_EMBEDS = [
  {
    id: 'on-repeat',
    title: 'On Repeat',
    artist: 'Hitesh · Current Rotation',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1EpqzIMHhRuedO?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1EpqzIMHhRuedO',
  },
  {
    id: 'cool-songs',
    title: 'Cool Songs',
    artist: 'Hitesh · Curated Favorites',
    embedUrl: 'https://open.spotify.com/embed/playlist/30P5dthP9d1wWO3bZazwCZ?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/30P5dthP9d1wWO3bZazwCZ',
  },
  {
    id: 'lofi-beats',
    title: 'Lofi Girl - Peaceful Piano',
    artist: 'Lofi Records',
    embedUrl: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM',
  },
]

/**
 * Converts any standard Spotify web link (playlist, track, album, artist)
 * to an authentic, responsive Spotify Embed player URL.
 * Handles localized URLs (intl-xx) and trailing query parameters safely.
 */
export function toSpotifyEmbedUrl(url) {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|track|album|artist)\/([a-zA-Z0-9_-]+)/)
  if (match) {
    const [, type, id] = match
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  }
  return url
}

export const USER_SPOTIFY_CONFIG = {
  // Personal Spotify Playlist or Top Tracks link
  defaultPlaylistUrl: 'https://open.spotify.com/playlist/37i9dQZF1EpqzIMHhRuedO',
  profileUrl: 'https://open.spotify.com',
}
