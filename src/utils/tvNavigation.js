const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[role="button"]',
  '[role="link"]',
  '[data-tv-focusable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]'

function isVisible(element) {
  if (!(element instanceof HTMLElement)) return false
  if (element.closest('[aria-hidden="true"], [hidden]')) return false

  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function getFocusableElements() {
  return [...document.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isVisible)
}

function makeCustomControlsFocusable(root = document) {
  root.querySelectorAll?.('[role="button"], [role="link"], [data-tv-focusable]').forEach((element) => {
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0')
  })
}

function centerOf(element) {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function isInDirection(dx, dy, key) {
  if (key === 'ArrowLeft') return dx < -4
  if (key === 'ArrowRight') return dx > 4
  if (key === 'ArrowUp') return dy < -4
  return dy > 4
}

function findNextElement(current, key, elements) {
  const from = centerOf(current)

  return elements
    .filter((element) => element !== current)
    .map((element) => {
      const to = centerOf(element)
      const dx = to.x - from.x
      const dy = to.y - from.y
      if (!isInDirection(dx, dy, key)) return null

      const horizontal = key === 'ArrowLeft' || key === 'ArrowRight'
      const forwardDistance = Math.abs(horizontal ? dx : dy)
      const sideDistance = Math.abs(horizontal ? dy : dx)

      // Prefer a control in the same visual row/column, then the nearest one.
      const score = forwardDistance + sideDistance * 2.4
      return { element, score }
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)[0]?.element
}

function firstElement(elements) {
  const preferred = document.querySelector(
    '.sis3-play:not([disabled]), [data-tv-initial-focus], main button:not([disabled]), main a[href]',
  )
  if (preferred && isVisible(preferred)) return preferred

  return [...elements].sort((a, b) => {
    const aRect = a.getBoundingClientRect()
    const bRect = b.getBoundingClientRect()
    return aRect.top - bRect.top || aRect.left - bRect.left
  })[0]
}

function focusElement(element) {
  document.documentElement.classList.add('tv-navigation-active')

  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }

  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  })
}

export function installTvNavigation() {
  makeCustomControlsFocusable()

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches?.('[role="button"], [role="link"], [data-tv-focusable]') &&
              !node.hasAttribute('tabindex')) {
            node.setAttribute('tabindex', '0')
          }
          makeCustomControlsFocusable(node)
        }
      })
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })

  const onKeyDown = (event) => {
    const active = document.activeElement

    if (ARROW_KEYS.has(event.key)) {
      if (active?.matches?.(EDITABLE_SELECTOR)) return

      const elements = getFocusableElements()
      if (!elements.length) return

      const current = elements.includes(active) ? active : null
      const target = current
        ? findNextElement(current, event.key, elements)
        : firstElement(elements)

      if (!target) return

      event.preventDefault()
      event.stopPropagation()
      focusElement(target)
      return
    }

    // Native links and buttons already handle Enter. This covers custom controls.
    if (
      (event.key === 'Enter' || event.keyCode === 13) &&
      active instanceof HTMLElement &&
      active.matches('[role="button"], [role="link"], [data-tv-focusable]') &&
      !active.matches('a, button, input, select, textarea')
    ) {
      event.preventDefault()
      active.click()
    }
  }

  window.addEventListener('keydown', onKeyDown, true)

  return () => {
    observer.disconnect()
    window.removeEventListener('keydown', onKeyDown, true)
  }
}
