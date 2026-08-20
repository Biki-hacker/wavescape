import type { TVChannel, TVStream } from '../types'

export interface OngoingProgram {
  title: string
  subtitle?: string
  genre: string
  startTime: string
  endTime: string
  progress: number // percentage 0 to 100
  remainingMinutes: number
  upNextTitle: string
  upNextTime: string
}

interface ProgramTemplate {
  title: string
  subtitle: string
  genre: string
}

// Category program schedules organized by time of day (morning: 06-12, afternoon: 12-18, prime: 18-23, night: 23-06)
const CATEGORY_SCHEDULES: Record<string, { morning: ProgramTemplate[]; afternoon: ProgramTemplate[]; prime: ProgramTemplate[]; night: ProgramTemplate[] }> = {
  news: {
    morning: [
      { title: 'Global Morning Bulletin', subtitle: 'Live world headlines, financial markets & weather reports', genre: 'Live News' },
      { title: 'Morning Edition Live', subtitle: 'In-depth interviews, political analysis & international coverage', genre: 'Current Affairs' },
      { title: 'Breakfast Newsroom', subtitle: 'Breaking updates, regional news & sports overview', genre: 'News' },
    ],
    afternoon: [
      { title: 'Midday World Report', subtitle: 'Live anchor desk coverage with field correspondents', genre: 'Live News' },
      { title: 'Global Focus & Markets', subtitle: 'Business insights, technology reports & global economics', genre: 'Finance' },
      { title: 'Afternoon News Direct', subtitle: 'Continuous breaking news & special reports', genre: 'Live News' },
    ],
    prime: [
      { title: 'Prime Time Evening News', subtitle: 'Top international stories, exclusive reports & panel debate', genre: 'Prime News' },
      { title: 'The World Tonight', subtitle: 'Comprehensive daily recap & geopolitical analysis', genre: 'News Analysis' },
      { title: 'Special Investigation Live', subtitle: 'Investigative journalism & documentary features', genre: 'Documentary' },
    ],
    night: [
      { title: 'Nightline Global Broadcast', subtitle: 'Overnight world news feed & live international wires', genre: 'Late News' },
      { title: 'Late Edition Live', subtitle: 'Recap of global events & overnight market trends', genre: 'News' },
      { title: 'World News Overnight', subtitle: 'Simulcast live updates from international bureaus', genre: 'Overnight' },
    ],
  },
  sports: {
    morning: [
      { title: 'Morning Sports Central', subtitle: 'Highlights, scores & tactical match analysis', genre: 'Sports News' },
      { title: 'Premier Sports Preview', subtitle: 'Weekend fixtures, athlete interviews & predictions', genre: 'Sports Talk' },
    ],
    afternoon: [
      { title: 'Matchday Arena Live', subtitle: 'Live game coverage, stats & real-time commentary', genre: 'Live Sports' },
      { title: 'Championship Showcase', subtitle: 'Global league action & top tournament recaps', genre: 'Highlights' },
    ],
    prime: [
      { title: 'Prime Time Game Live', subtitle: 'Feature match of the day with live studio analysis', genre: 'Live Broadcast' },
      { title: 'The Sports Center', subtitle: 'Full round-up of all today’s decisive moments', genre: 'Sports' },
    ],
    night: [
      { title: 'Late Night Sports Replay', subtitle: 'Full match encore & extended tournament highlights', genre: 'Replay' },
      { title: 'Motorsport & Extreme Hour', subtitle: 'High-octane racing series & outdoor action', genre: 'Motorsport' },
    ],
  },
  music: {
    morning: [
      { title: 'Morning Soundwaves', subtitle: 'Upbeat chart toppers & energizing morning playlist', genre: 'Pop / Rock' },
      { title: 'Acoustic Sunrise Sessions', subtitle: 'Relaxed acoustic sets, indie tracks & ambient sounds', genre: 'Acoustic' },
    ],
    afternoon: [
      { title: 'Top 40 Live Countdown', subtitle: 'The most streamed international hits & new releases', genre: 'Hits' },
      { title: 'Retro Groove & Classics', subtitle: 'Timeless anthems from 80s, 90s & 2000s', genre: 'Retro Hits' },
    ],
    prime: [
      { title: 'Live Soundstage & Festivals', subtitle: 'Exclusive concert performances & artist spotlights', genre: 'Live Concert' },
      { title: 'The Ultimate Hit Mix', subtitle: 'Continuous non-stop party anthems & visual music', genre: 'Electronic' },
    ],
    night: [
      { title: 'Midnight Club Live', subtitle: 'Deep house, electronic sessions & late night mixes', genre: 'Club / Dance' },
      { title: 'Chillout & Lo-Fi Lounge', subtitle: 'Atmospheric nocturnal soundscapes & visual vibes', genre: 'Chillout' },
    ],
  },
  movies: {
    morning: [
      { title: 'Classic Cinema Matinee', subtitle: 'Golden age Hollywood gems & remastered classics', genre: 'Cinema' },
      { title: 'Family Movie Morning', subtitle: 'Wholesome adventure & award-winning stories', genre: 'Family Movie' },
    ],
    afternoon: [
      { title: 'Afternoon Feature Presentation', subtitle: 'Thrilling mystery & dramatic cinematic features', genre: 'Drama' },
      { title: 'Action Cinema Showcase', subtitle: 'Blockbuster action, stunts & sci-fi adventure', genre: 'Action' },
    ],
    prime: [
      { title: 'Prime Time Blockbuster', subtitle: 'High-definition feature film premiere with stereo audio', genre: 'Blockbuster' },
      { title: 'Mystery & Thriller Theater', subtitle: 'Suspenseful narrative & psychological drama', genre: 'Thriller' },
    ],
    night: [
      { title: 'Midnight Cult Cinema', subtitle: 'Sci-fi classics, midnight thrillers & indie films', genre: 'Cult Film' },
      { title: 'Noir & Late Night Vault', subtitle: 'Vintage noir cinema & atmospheric midnight tales', genre: 'Classic Film' },
    ],
  },
  animation: {
    morning: [
      { title: 'Morning Cartoon Mania', subtitle: 'Animated series, comedy shorts & colorful fun', genre: 'Cartoons' },
      { title: 'Anime Sunrise Adventures', subtitle: 'Heroic quests & fantasy animation episodes', genre: 'Anime' },
    ],
    afternoon: [
      { title: 'Afternoon Toon Block', subtitle: 'Favorite animated characters & brand-new episodes', genre: 'Animation' },
      { title: 'Epic Animated Legends', subtitle: 'Action anime & futuristic adventure storylines', genre: 'Sci-Fi Anime' },
    ],
    prime: [
      { title: 'Prime Time Anime Showcase', subtitle: 'Top-rated animated feature film & seasonal series', genre: 'Anime' },
      { title: 'Animated Universe Special', subtitle: 'Feature-length animation & behind-the-scenes', genre: 'Feature' },
    ],
    night: [
      { title: 'Late Night Anime Theater', subtitle: 'Uncut Japanese anime series & dark fantasy', genre: 'Late Anime' },
      { title: 'Retro Toon Vault', subtitle: 'Vintage animated classics & nostalgic shorts', genre: 'Retro' },
    ],
  },
  documentary: {
    morning: [
      { title: 'Planet Earth Chronicles', subtitle: 'Breathtaking wildlife photography & ocean habitats', genre: 'Nature' },
      { title: 'Ancient Civilizations', subtitle: 'Archaeological discoveries & lost empire histories', genre: 'History' },
    ],
    afternoon: [
      { title: 'Science & Cosmos Frontiers', subtitle: 'Space exploration, astrophysics & cutting-edge tech', genre: 'Science' },
      { title: 'World Expeditions', subtitle: 'Cultural journeys & remote human communities', genre: 'Travel' },
    ],
    prime: [
      { title: 'Prime Time Feature Doc', subtitle: 'Award-winning investigative documentary special', genre: 'Documentary' },
      { title: 'Secrets of the Deep', subtitle: 'Marine biology & oceanic wonders in 4K', genre: 'Nature' },
    ],
    night: [
      { title: 'Night Sky & Universe Deep Dive', subtitle: 'Telescopic galaxy tours & cosmic mysteries', genre: 'Astronomy' },
      { title: 'Historical Archives', subtitle: 'Rare archival footage & 20th century chronicles', genre: 'History' },
    ],
  },
  entertainment: {
    morning: [
      { title: 'The Morning Talk Show', subtitle: 'Celebrity guests, lifestyle tips & viral culture', genre: 'Talk Show' },
      { title: 'Sunrise Variety Hour', subtitle: 'Live entertainment, cooking & trending discussions', genre: 'Variety' },
    ],
    afternoon: [
      { title: 'Daytime Drama & Romance', subtitle: 'Engrossing serial episodes & dramatic twists', genre: 'Drama' },
      { title: 'Game Show Live Challenge', subtitle: 'High-stakes trivia, contestants & prizes', genre: 'Game Show' },
    ],
    prime: [
      { title: 'The Prime Time Variety Gala', subtitle: 'Music performances, comedy sets & star interviews', genre: 'Prime Time' },
      { title: 'Reality Showdown Live', subtitle: 'Competition series & weekly elimination round', genre: 'Reality TV' },
    ],
    night: [
      { title: 'Late Night Live with Guests', subtitle: 'Monologues, comedic sketches & musical guests', genre: 'Late Night' },
      { title: 'Comedy Spotlight Live', subtitle: 'Stand-up comedy sets & satirical roundtables', genre: 'Comedy' },
    ],
  },
}

// Fallback general schedule
const GENERAL_SCHEDULE = {
  morning: [
    { title: 'Global Morning Broadcast', subtitle: 'Live updates, cultural highlights & world overview', genre: 'General' },
    { title: 'Sunrise Live Stream', subtitle: 'Morning features, international stories & news', genre: 'Magazine' },
  ],
  afternoon: [
    { title: 'Afternoon Live Channel', subtitle: 'Daytime programming & regional perspectives', genre: 'Broadcast' },
    { title: 'World Panorama Live', subtitle: 'Documentary features & international spotlights', genre: 'Culture' },
  ],
  prime: [
    { title: 'Prime Time Television Special', subtitle: 'Evening feature program with high-definition audio', genre: 'Prime Time' },
    { title: 'The Evening Showcase', subtitle: 'Spotlight stories, arts & entertainment', genre: 'Showcase' },
  ],
  night: [
    { title: 'Late Night Transmission', subtitle: 'Overnight ambient programming & nocturnal feeds', genre: 'Overnight' },
    { title: 'Night Watch Live', subtitle: 'Continuous international broadcast stream', genre: 'Live Feed' },
  ],
}

/**
 * Deterministic hash from string.
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Formats a 24-hour hour/minute pair into "HH:MM" string.
 */
function formatTime(hour: number, minute: number): string {
  const h = (hour % 24).toString().padStart(2, '0')
  const m = minute.toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Generates the ongoing program for a given TV channel based on category, time and date.
 */
export function getOngoingProgram(
  channel: TVChannel,
  _stream?: TVStream | null,
  timezone?: string
): OngoingProgram {
  // Get current time in specified timezone or fallback to local
  let now: Date
  try {
    if (timezone) {
      const dateString = new Date().toLocaleString('en-US', { timeZone: timezone })
      now = new Date(dateString)
    } else {
      now = new Date()
    }
  } catch {
    now = new Date()
  }

  const hour = now.getHours()
  const minute = now.getMinutes()
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

  // Determine time-of-day block
  let timeBlock: 'morning' | 'afternoon' | 'prime' | 'night'
  if (hour >= 6 && hour < 12) {
    timeBlock = 'morning'
  } else if (hour >= 12 && hour < 18) {
    timeBlock = 'afternoon'
  } else if (hour >= 18 && hour < 23) {
    timeBlock = 'prime'
  } else {
    timeBlock = 'night'
  }

  // Find matching category schedule
  const channelCat = (channel.categories?.[0] ?? '').toLowerCase()
  let scheduleGroup = GENERAL_SCHEDULE

  for (const [key, sched] of Object.entries(CATEGORY_SCHEDULES)) {
    if (channelCat.includes(key) || channel.name.toLowerCase().includes(key)) {
      scheduleGroup = sched
      break
    }
  }

  const templates = scheduleGroup[timeBlock]
  const seed = simpleHash(`${channel.id}-${dateKey}-${hour}`)
  const selected = templates[seed % templates.length]!

  // Next block program
  const nextHour = (hour + 1) % 24
  let nextTimeBlock: 'morning' | 'afternoon' | 'prime' | 'night' = timeBlock
  if (nextHour >= 6 && nextHour < 12) nextTimeBlock = 'morning'
  else if (nextHour >= 12 && nextHour < 18) nextTimeBlock = 'afternoon'
  else if (nextHour >= 18 && nextHour < 23) nextTimeBlock = 'prime'
  else nextTimeBlock = 'night'

  const nextTemplates = scheduleGroup[nextTimeBlock]
  const nextSeed = simpleHash(`${channel.id}-${dateKey}-${nextHour}`)
  const nextProgram = nextTemplates[nextSeed % nextTemplates.length]!

  const startTime = formatTime(hour, 0)
  const endTime = formatTime(hour + 1, 0)
  const progress = Math.min(Math.max(Math.round((minute / 60) * 100), 0), 100)
  const remainingMinutes = Math.max(60 - minute, 1)

  // Customized title if channel has a prominent network name
  let title = selected.title
  if (channel.network && !title.includes(channel.network)) {
    title = `${title}`
  }

  return {
    title,
    subtitle: selected.subtitle,
    genre: selected.genre,
    startTime,
    endTime,
    progress,
    remainingMinutes,
    upNextTitle: nextProgram.title,
    upNextTime: formatTime(hour + 1, 0),
  }
}
