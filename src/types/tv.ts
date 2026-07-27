export interface TVChannel {
  id: string
  name: string
  alt_names: string[]
  network: string | null
  owners: string[]
  country: string
  categories: string[]
  is_nsfw: boolean
  launched: string | null
  closed: string | null
  replaced_by: string | null
  website: string | null
  logo?: string // resolved from logos API
}

export interface TVCategory {
  id: string
  name: string
  description: string
}

export interface TVStream {
  channel: string | null
  feed: string | null
  title: string
  url: string
  referrer: string | null
  user_agent: string | null
  quality: string | null
  label: string | null
}

export interface TVLogo {
  channel: string
  feed: string | null
  in_use: boolean
  tags: string[]
  width: number
  height: number
  format: string | null
  url: string
}

export interface TVCountry {
  name: string
  code: string
  languages: string[]
  flag: string
}
