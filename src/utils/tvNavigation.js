var FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[role="button"]',
  '[role="link"]',
  '[data-tv-focusable]',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

var EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]'

function toArray(list) {
  return Array.prototype.slice.call(list || [])
}

function getArrowKey(event) {
  if (event.key === 'ArrowLeft' || event.keyCode === 37) return 'ArrowLeft'
  if (event.key === 'ArrowUp' || event.keyCode === 38) return 'ArrowUp'
  if (event.key === 'ArrowRight' || event.keyCode === 39) return 'ArrowRight'
  if (event.key === 'ArrowDown' || event.keyCode === 40) return 'ArrowDown'
  return ''
}

function isBackKey(event) {
  return event.keyCode === 10009 ||
    event.which === 10009 ||
    event.key === 'BrowserBack' ||
    event.key === 'Back'
}

function isVisible(element) {
  if (!element || element.nodeType !== 1) return false
  if (element.closest && element.closest('[aria-hidden="true"], [hidden]')) return false

  var style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false
  }

  var rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function getActiveDialog() {
  var dialogs = toArray(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).filter(isVisible)
  return dialogs.length ? dialogs[dialogs.length - 1] : null
}

function getNavigationScope() {
  return getActiveDialog() || document
}

function getFocusableElements() {
  var scope = getNavigationScope()
  return toArray(scope.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible)
}

function makeCustomControlsFocusable(root) {
  var scope = root || document
  if (!scope.querySelectorAll) return

  var controls = scope.querySelectorAll('[role="button"], [role="link"], [data-tv-focusable]')
  toArray(controls).forEach(function (element) {
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0')
  })
}

function centerOf(element) {
  var rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

function isInDirection(dx, dy, key) {
  if (key === 'ArrowLeft') return dx < -4
  if (key === 'ArrowRight') return dx > 4
  if (key === 'ArrowUp') return dy < -4
  return dy > 4
}

function findNextElement(current, key, elements) {
  var from = centerOf(current)
  var horizontal = key === 'ArrowLeft' || key === 'ArrowRight'
  var candidates = []

  elements.forEach(function (element) {
    if (element === current) return
    var to = centerOf(element)
    var dx = to.x - from.x
    var dy = to.y - from.y
    if (!isInDirection(dx, dy, key)) return

    var forwardDistance = Math.abs(horizontal ? dx : dy)
    var sideDistance = Math.abs(horizontal ? dy : dx)
    candidates.push({
      element: element,
      forward: forwardDistance,
      side: sideDistance,
      inLane: sideDistance <= Math.max(72, forwardDistance * 0.55)
    })
  })

  if (!candidates.length) return null
  var laneCandidates = candidates.filter(function (candidate) { return candidate.inLane })
  var pool = laneCandidates.length ? laneCandidates : candidates
  pool.sort(function (a, b) {
    return (a.forward + a.side * 4) - (b.forward + b.side * 4)
  })
  return pool[0].element
}

function firstElement(elements) {
  var scope = getNavigationScope()
  var preferred

  if (scope !== document) {
    preferred = scope.querySelector(
      '[data-tv-initial-focus], [data-tv-close], button[aria-label="Close player"], button:not([disabled]), a[href]'
    )
  } else {
    preferred = document.querySelector(
      '.sis3-play:not([disabled]), [data-tv-initial-focus], main button:not([disabled]), main a[href]'
    )
  }

  if (preferred && isVisible(preferred)) return preferred

  return elements.slice().sort(function (a, b) {
    var aRect = a.getBoundingClientRect()
    var bRect = b.getBoundingClientRect()
    return aRect.top - bRect.top || aRect.left - bRect.left
  })[0]
}

function focusElement(element) {
  if (!element) return
  document.documentElement.classList.add('tv-navigation-active')

  try {
    element.focus({ preventScroll: true })
  } catch (error) {
    element.focus()
  }

  try {
    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'auto'
    })
  } catch (error) {
    element.scrollIntoView(false)
  }
}

function focusOpenDialog() {
  var dialog = getActiveDialog()
  if (!dialog) return
  var elements = toArray(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible)
  focusElement(firstElement(elements))
}

function showExitDialog() {
  if (document.querySelector('.sis-tv-exit')) return

  var dialog = document.createElement('div')
  dialog.className = 'sis-tv-exit'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', 'Exit SHORTSinSHORT')

  var panel = document.createElement('div')
  panel.className = 'sis-tv-exit-panel'

  var title = document.createElement('h2')
  title.textContent = 'EXIT SHORTSinSHORT?'

  var text = document.createElement('p')
  text.textContent = 'क्या आप एप बंद करना चाहते हैं?'

  var actions = document.createElement('div')
  actions.className = 'sis-tv-exit-actions'

  var noButton = document.createElement('button')
  noButton.type = 'button'
  noButton.textContent = 'NO'
  noButton.setAttribute('data-tv-close', '')
  noButton.setAttribute('data-tv-initial-focus', '')
  noButton.addEventListener('click', function () {
    if (dialog.parentNode) dialog.parentNode.removeChild(dialog)
  })

  var yesButton = document.createElement('button')
  yesButton.type = 'button'
  yesButton.textContent = 'YES'
  yesButton.addEventListener('click', function () {
    try {
      if (window.tizen && window.tizen.application) {
        window.tizen.application.getCurrentApplication().exit()
        return
      }
    } catch (error) {
      // Use window.close when the hosted page cannot access the Tizen API.
    }
    window.close()
  })

  actions.appendChild(noButton)
  actions.appendChild(yesButton)
  panel.appendChild(title)
  panel.appendChild(text)
  panel.appendChild(actions)
  dialog.appendChild(panel)
  document.body.appendChild(dialog)
  window.setTimeout(function () { focusElement(noButton) }, 50)
}

function closeCurrentView() {
  var dialog = getActiveDialog()

  if (dialog) {
    var closeButton = dialog.querySelector(
      '[data-tv-close], button[aria-label="Close player"], button[aria-label^="Close"]'
    )
    if (closeButton) {
      closeButton.click()
      return true
    }
  }

  if (window.location.pathname !== '/') {
    window.history.back()
    return true
  }

  showExitDialog()
  return true
}

export function installTvNavigation() {
  makeCustomControlsFocusable(document)

  var observer = new MutationObserver(function (mutations) {
    var dialogAdded = false

    mutations.forEach(function (mutation) {
      toArray(mutation.addedNodes).forEach(function (node) {
        if (!node || node.nodeType !== 1) return

        if (
          node.matches &&
          node.matches('[role="button"], [role="link"], [data-tv-focusable]') &&
          !node.hasAttribute('tabindex')
        ) {
          node.setAttribute('tabindex', '0')
        }

        makeCustomControlsFocusable(node)

        if (
          (node.matches && node.matches('[role="dialog"][aria-modal="true"]')) ||
          (node.querySelector && node.querySelector('[role="dialog"][aria-modal="true"]'))
        ) {
          dialogAdded = true
        }
      })
    })

    if (dialogAdded) {
      window.setTimeout(focusOpenDialog, 50)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  function onKeyDown(event) {
    var active = document.activeElement

    if (isBackKey(event)) {
      if (closeCurrentView()) {
        event.preventDefault()
        event.stopPropagation()
      }
      return
    }

    var arrowKey = getArrowKey(event)
    var activePlayer = document.querySelector('.sis3-player[data-tv-player]')
    var playerControls = activePlayer && activePlayer.querySelector('.sis-tv-player-controls')
    var controlsHidden = playerControls && playerControls.classList.contains('is-hidden')

    if (activePlayer && arrowKey && controlsHidden) {
      if (arrowKey === 'ArrowUp' || arrowKey === 'ArrowDown') {
        event.preventDefault()
        event.stopPropagation()
        window.dispatchEvent(new CustomEvent('sis-tv-show-controls'))
        return
      }
    }

    if (arrowKey) {
      if (active && active.matches && active.matches(EDITABLE_SELECTOR)) return

      var elements = getFocusableElements()
      if (!elements.length) return

      var current = elements.indexOf(active) !== -1 ? active : null
      var target = current
        ? findNextElement(current, arrowKey, elements)
        : firstElement(elements)

      if (!target) return

      event.preventDefault()
      event.stopPropagation()
      focusElement(target)
      return
    }

    var isEnter = event.key === 'Enter' || event.keyCode === 13
    var isCustomControl =
      active &&
      active.nodeType === 1 &&
      active.matches &&
      active.matches('[role="button"], [role="link"], [data-tv-focusable]') &&
      !active.matches('a, button, input, select, textarea')

    if (isEnter && activePlayer && (controlsHidden || active === activePlayer)) {
      event.preventDefault()
      event.stopPropagation()
      window.dispatchEvent(new CustomEvent('sis-tv-toggle-playback'))
      return
    }

    if (isEnter && isCustomControl) {
      event.preventDefault()
      active.click()
    }
  }

  window.addEventListener('keydown', onKeyDown, true)

  return function () {
    observer.disconnect()
    window.removeEventListener('keydown', onKeyDown, true)
  }
}
