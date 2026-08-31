import { useRef, useState } from 'react'
import MovieCard from './MovieCard'

export default function MovieRow({ title, films, onPlay }) {
  const scrollRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const [dragged, setDragged] = useState(false)

  if (!films || films.length === 0) return null

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const onMouseDown = (e) => {
    isDragging.current = true
    setDragged(false)
    startX.current = e.pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
  }

  const onMouseMove = (e) => {
    if (!isDragging.current) return
    const dx = e.pageX - startX.current
    if (Math.abs(dx) > 5) setDragged(true)
    scrollRef.current.scrollLeft = scrollLeftStart.current - dx
  }

  const stopDragging = () => {
    isDragging.current = false
  }

  return (
    <section className="relative py-4">
      <h2 className="mb-3 px-6 text-lg font-bold text-white sm:px-10 sm:text-xl lg:px-16">
        {title}
      </h2>

      <div className="group/row relative">
        {/* Left arrow */}
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-0 z-20 hidden h-full w-10 items-center justify-center bg-gradient-to-r from-black/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 sm:flex"
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          className="scrollbar-hide flex cursor-grab gap-3 overflow-x-auto scroll-smooth px-6 pb-2 active:cursor-grabbing sm:px-10 lg:px-16"
          style={{ scrollbarWidth: 'none' }}
        >
          {films.map((film) => (
            <MovieCard
              key={film.id}
              film={film}
              onPlay={(f) => {
                if (!dragged) onPlay(f)
              }}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-0 z-20 hidden h-full w-10 items-center justify-center bg-gradient-to-l from-black/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 sm:flex"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  )
}
