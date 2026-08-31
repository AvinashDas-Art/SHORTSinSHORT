#!/usr/bin/env node
// Daily automation: pulls the next candidate film out of
// scripts/film-backlog.json and appends it to src/data/films.json.
//
// Design notes:
// - Real, verified YouTube IDs cannot be invented safely (a wrong ID
//   breaks the thumbnail and the player). So candidates land with
//   youtubeVideoId: "REPLACE_ME" until a human/editor supplies the
//   verified ID (the site already renders a graceful "Coming Soon"
//   fallback for that state — see src/components/MovieCard.jsx).
// - This script is intentionally dependency-free (only Node's fs/path)
//   so the GitHub Actions runner needs nothing but Node itself.
//
// Usage: node scripts/add-daily-film.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const FILMS_PATH = join(ROOT, 'src/data/films.json')
const BACKLOG_PATH = join(ROOT, 'scripts/film-backlog.json')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function nextId(films) {
  const max = films.reduce((acc, f) => {
    const n = parseInt(String(f.id).replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 0)
  return `sf${String(max + 1).padStart(3, '0')}`
}

function thumbnailFor(youtubeVideoId) {
  return `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
}

function main() {
  const films = readJson(FILMS_PATH)
  const backlog = readJson(BACKLOG_PATH)

  if (backlog.length === 0) {
    console.log('Backlog is empty — nothing to add today. Add more candidates to scripts/film-backlog.json.')
    return
  }

  const candidate = backlog.shift()
  const newFilm = {
    id: nextId(films),
    title: candidate.title,
    description: candidate.description,
    youtubeVideoId: candidate.youtubeVideoId || 'REPLACE_ME',
    thumbnailUrl: thumbnailFor(candidate.youtubeVideoId || 'REPLACE_ME'),
    genre: candidate.genre,
    language: candidate.language,
    country: candidate.country,
    popularityScore: candidate.popularityScore ?? 50,
    duration: candidate.duration,
    isFeatured: Boolean(candidate.isFeatured),
  }

  films.push(newFilm)

  writeJson(FILMS_PATH, films)
  writeJson(BACKLOG_PATH, backlog)

  console.log(`Added "${newFilm.title.en}" (${newFilm.id}) to films.json. ${backlog.length} candidate(s) left in backlog.`)
}

main()
