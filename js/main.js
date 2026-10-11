/**
 * VELCORE — Responsive & Interactive Controller
 */

(function () {
  'use strict';

  const DESKTOP_WIDTH = 1920;
  const MOBILE_WIDTH = 440;
  const BREAKPOINT = 900;

  /**
   * Dynamically calculate and apply zoom scale factors to CSS custom properties
   */
  function updateViewportScale() {
    const width = window.innerWidth || document.documentElement.clientWidth;

    if (width >= BREAKPOINT) {
      // Desktop: Scale down on laptops and monitors < 1920px so layout never overflows
      const scale = width < DESKTOP_WIDTH ? (width / DESKTOP_WIDTH) : 1;
      document.documentElement.style.setProperty('--desktop-scale', scale.toFixed(5));
    } else {
      // Mobile: Scale down on smartphones < 440px (e.g. 360px, 375px, 390px, 412px)
      // On tablets 440px - 899px, center with scale ~1
      let scale = 1;
      if (width <= MOBILE_WIDTH) {
        scale = width / MOBILE_WIDTH;
      } else if (width <= 540) {
        scale = width / MOBILE_WIDTH;
      } else {
        scale = 1;
      }
      document.documentElement.style.setProperty('--mobile-scale', scale.toFixed(5));
    }
  }

  // Initial calculation before render to prevent layout jump
  updateViewportScale();

  // Listeners for screen resize and device orientation changes
  window.addEventListener('resize', updateViewportScale, { passive: true });
  window.addEventListener('orientationchange', updateViewportScale, { passive: true });
  document.addEventListener('DOMContentLoaded', updateViewportScale);

  /**
   * Smooth Anchor Navigation
   */
  function setupNavigation() {
    const isMobile = () => window.innerWidth < BREAKPOINT;

    // Mapping for desktop and mobile navigation targets
    const navMap = {
      market: { desktop: '3_71', mobile: '3_525' },
      calc: { desktop: '3_137', mobile: '3_588' },
      tariffs: { desktop: '3_197', mobile: '3_647' },
      faq: { desktop: '3_307', mobile: '3_695' },
      form: { desktop: '3_364', mobile: 'mobile-lead-form' }
    };

    function scrollToSection(key) {
      const targetId = isMobile() ? navMap[key]?.mobile : navMap[key]?.desktop;
      if (!targetId) return;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (key === 'form') {
          setTimeout(() => {
            const phone = document.getElementById(isMobile() ? 'mobile-phone' : 'desktop-phone');
            if (phone) phone.focus();
          }, 650);
        }
      }
    }

    // Attach click handlers to desktop header links & CTAs
    const desktopLinks = [
      { id: '3_449', key: 'market' },
      { id: '3_450', key: 'calc' },
      { id: '3_451', key: 'tariffs' },
      { id: '3_452', key: 'faq' },
      { id: '3_453', key: 'form' },
      { id: '3_22', key: 'calc' },
      { id: '3_195', key: 'form' },
      { id: '3_233', key: 'form' },
      { id: '3_267', key: 'form' },
      { id: '3_301', key: 'form' }
    ];

    desktopLinks.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToSection(key);
        });
      }
    });

    // Attach click handlers to mobile buttons & CTAs
    const mobileLinks = [
      { id: '3_476', key: 'calc' },
      { id: '3_645', key: 'form' },
      { id: '3_682', key: 'form' }
    ];

    mobileLinks.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToSection(key);
        });
      }
    });
  }

  /**
   * Mobile Burger Menu Drawer Controller
   */
  function setupMobileBurger() {
    const burgerBtn = document.getElementById('3_826');
    const drawer = document.getElementById('mobile-menu-drawer');
    const closeBtn = document.getElementById('mobile-menu-close-btn');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (!burgerBtn || !drawer) return;

    function openMenu() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      burgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (drawer.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    burgerBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (drawer.classList.contains('is-open')) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= BREAKPOINT && drawer.classList.contains('is-open')) {
        closeMenu();
      }
    }, { passive: true });

    const mobileTargets = {
      market: '3_525',
      calc: '3_588',
      tariffs: '3_647',
      faq: '3_695',
      form: 'mobile-lead-form'
    };

    drawer.querySelectorAll('[data-nav-target]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetKey = link.getAttribute('data-nav-target');
        closeMenu();

        const targetId = mobileTargets[targetKey];
        if (!targetId) return;

        setTimeout(() => {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (targetKey === 'form') {
              setTimeout(() => {
                const phoneInp = document.getElementById('mobile-phone');
                if (phoneInp) phoneInp.focus();
              }, 500);
            }
          }
        }, 180);
      });
    });
  }

  /**
   * Interactive Partner Calculator
   */
  function setupCalculator() {
    // Limits
    const SUB_MIN = 100;
    const SUB_MAX = 100000;
    const SUB_EXP = 2.65; // Non-linear exponent mapping 90px position to exactly 700

    const PRICE_MIN = 100;
    const PRICE_MAX = 499;

    // Current State
    const state = {
      subscribers: 700,
      price: 299
    };

    // Converter: Subscribers <-> Ratio [0, 1]
    function subToRatio(sub) {
      const clamped = Math.max(SUB_MIN, Math.min(SUB_MAX, sub));
      return Math.pow((clamped - SUB_MIN) / (SUB_MAX - SUB_MIN), 1 / SUB_EXP);
    }

    function ratioToSub(ratio) {
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      const raw = SUB_MIN + (SUB_MAX - SUB_MIN) * Math.pow(clampedRatio, SUB_EXP);

      if (raw <= 1000) {
        return Math.round(raw / 50) * 50;
      } else if (raw <= 5000) {
        return Math.round(raw / 100) * 100;
      } else if (raw <= 10000) {
        return Math.round(raw / 250) * 250;
      } else if (raw <= 50000) {
        return Math.round(raw / 500) * 500;
      } else {
        return Math.round(raw / 1000) * 1000;
      }
    }

    // Converter: Price <-> Ratio [0, 1]
    function priceToRatio(price) {
      return (Math.max(PRICE_MIN, Math.min(PRICE_MAX, price)) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN);
    }

    function ratioToPrice(ratio) {
      const clamped = Math.max(0, Math.min(1, ratio));
      return Math.round(PRICE_MIN + (PRICE_MAX - PRICE_MIN) * clamped);
    }

    // Formatters
    function formatRub(num, isNegative = false) {
      const formatted = Math.round(num).toLocaleString('ru-RU');
      return (isNegative ? '− ' : '') + formatted + ' ₽';
    }

    function formatSub(num) {
      return Math.round(num).toLocaleString('ru-RU');
    }

    // Financial calculations
    function calculate(subscribers, price) {
      const revenue = Math.round(subscribers * price);
      const acquiring = Math.round(revenue * 0.049);
      const royalty = Math.round(revenue * 0.20);
      const tax = Math.round(revenue * 0.06);
      const maintenance = Math.round(subscribers * 42);
      const netProfit = revenue - acquiring - royalty - tax - maintenance;

      return {
        revenue,
        acquiring,
        royalty,
        tax,
        maintenance,
        netProfit
      };
    }

    // Element bindings
    const instances = [
      {
        type: 'desktop',
        trackWidth: 649,
        thumbWidth: 39,
        sub: {
          track: document.getElementById('3_150'),
          fill: document.getElementById('3_152'),
          thumb: document.getElementById('3_153'),
          display: document.getElementById('3_149')
        },
        price: {
          track: document.getElementById('3_161'),
          fill: document.getElementById('3_163'),
          thumb: document.getElementById('3_164'),
          display: document.getElementById('3_160')
        },
        outputs: {
          revenue: document.getElementById('3_173'),
          acquiring: document.getElementById('3_176'),
          royalty: document.getElementById('3_179'),
          tax: document.getElementById('3_182'),
          maintenance: document.getElementById('3_185'),
          profit: document.getElementById('3_190')
        }
      },
      {
        type: 'mobile',
        trackWidth: 360,
        thumbWidth: 39,
        sub: {
          track: document.getElementById('3_604'),
          fill: document.getElementById('3_606'),
          thumb: document.getElementById('3_607'),
          display: document.getElementById('3_603')
        },
        price: {
          track: document.getElementById('3_615'),
          fill: document.getElementById('3_617'),
          thumb: document.getElementById('3_618'),
          display: document.getElementById('3_614')
        },
        outputs: {
          revenue: document.getElementById('3_627'),
          acquiring: document.getElementById('3_630'),
          royalty: document.getElementById('3_633'),
          tax: document.getElementById('3_636'),
          maintenance: document.getElementById('3_639'),
          profit: document.getElementById('3_644')
        }
      }
    ];

    // Render state across all viewports
    function render() {
      const fin = calculate(state.subscribers, state.price);
      const subRatio = subToRatio(state.subscribers);
      const priceRatio = priceToRatio(state.price);

      instances.forEach((inst) => {
        const maxTravel = inst.trackWidth - inst.thumbWidth;

        // Subscribers slider
        if (inst.sub.display) {
          inst.sub.display.textContent = formatSub(state.subscribers);
        }
        if (inst.sub.thumb) {
          inst.sub.thumb.style.left = (subRatio * maxTravel).toFixed(1) + 'px';
        }
        if (inst.sub.fill) {
          const fillW = Math.max(24, subRatio * maxTravel + inst.thumbWidth / 2);
          inst.sub.fill.style.width = Math.min(inst.trackWidth, fillW).toFixed(1) + 'px';
        }

        // Price slider
        if (inst.price.display) {
          inst.price.display.textContent = state.price + '₽';
        }
        if (inst.price.thumb) {
          inst.price.thumb.style.left = (priceRatio * maxTravel).toFixed(1) + 'px';
        }
        if (inst.price.fill) {
          const fillW = Math.max(24, priceRatio * maxTravel + inst.thumbWidth / 2);
          inst.price.fill.style.width = Math.min(inst.trackWidth, fillW).toFixed(1) + 'px';
        }

        // Output figures
        if (inst.outputs.revenue) inst.outputs.revenue.textContent = formatRub(fin.revenue);
        if (inst.outputs.acquiring) inst.outputs.acquiring.textContent = formatRub(fin.acquiring, true);
        if (inst.outputs.royalty) inst.outputs.royalty.textContent = formatRub(fin.royalty, true);
        if (inst.outputs.tax) inst.outputs.tax.textContent = formatRub(fin.tax, true);
        if (inst.outputs.maintenance) inst.outputs.maintenance.textContent = formatRub(fin.maintenance, true);
        if (inst.outputs.profit) {
          inst.outputs.profit.textContent = formatRub(fin.netProfit);
          if (inst.type === 'mobile') {
            const digits = String(Math.abs(Math.round(fin.netProfit))).length;
            if (digits >= 8) {
              inst.outputs.profit.style.fontSize = '21px';
            } else if (digits >= 7) {
              inst.outputs.profit.style.fontSize = '23px';
            } else {
              inst.outputs.profit.style.fontSize = '25px';
            }
          } else if (inst.type === 'desktop') {
            const digits = String(Math.abs(Math.round(fin.netProfit))).length;
            if (digits >= 8) {
              inst.outputs.profit.style.fontSize = '44px';
            } else {
              inst.outputs.profit.style.fontSize = '50px';
            }
          }
        }
      });
    }

    // Attach pointer interaction handler to a track
    function bindSlider(trackEl, onRatioChange, getInitialValue, min, max, step) {
      if (!trackEl) return;

      trackEl.setAttribute('role', 'slider');
      trackEl.setAttribute('tabindex', '0');
      trackEl.setAttribute('aria-valuemin', min);
      trackEl.setAttribute('aria-valuemax', max);

      let isDragging = false;

      function updateFromPointer(e) {
        const rect = trackEl.getBoundingClientRect();
        if (!rect.width) return;
        const clientX = e.clientX;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        onRatioChange(ratio);
        render();
      }

      trackEl.addEventListener('pointerdown', (e) => {
        isDragging = true;
        try {
          trackEl.setPointerCapture(e.pointerId);
        } catch (_) {}
        updateFromPointer(e);
      });

      trackEl.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        updateFromPointer(e);
      });

      const stopDrag = (e) => {
        if (isDragging) {
          isDragging = false;
          try {
            trackEl.releasePointerCapture(e.pointerId);
          } catch (_) {}
        }
      };

      trackEl.addEventListener('pointerup', stopDrag);
      trackEl.addEventListener('pointercancel', stopDrag);

      // Keyboard arrow control
      trackEl.addEventListener('keydown', (e) => {
        let delta = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          delta = step;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          delta = -step;
        } else {
          return;
        }
        e.preventDefault();
        const curVal = getInitialValue();
        const newVal = Math.max(min, Math.min(max, curVal + delta));
        if (newVal !== curVal) {
          if (min === SUB_MIN) {
            state.subscribers = newVal;
          } else {
            state.price = newVal;
          }
          render();
        }
      });
    }

    // Bind all slider instances
    instances.forEach((inst) => {
      // Subscribers
      bindSlider(
        inst.sub.track,
        (ratio) => {
          state.subscribers = ratioToSub(ratio);
        },
        () => state.subscribers,
        SUB_MIN,
        SUB_MAX,
        50
      );

      // Price
      bindSlider(
        inst.price.track,
        (ratio) => {
          state.price = ratioToPrice(ratio);
        },
        () => state.price,
        PRICE_MIN,
        PRICE_MAX,
        5
      );
    });

    // Initial render to set exact positions and numbers
    render();
  }

  /**
   * Interactive FAQ Accordion
   */
  function setupAccordion() {
    const desktopSection = document.getElementById('3_314');
    const mobileSection = document.getElementById('3_695');

    function bindContainer(container) {
      if (!container) return;
      const items = container.querySelectorAll('.faq-item');

      items.forEach((item) => {
        const header = item.querySelector('.faq-header');
        if (!header) return;

        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');

        function toggle() {
          const isOpen = item.classList.contains('is-open');

          // Close other items in the same container for clean accordion UX
          items.forEach((other) => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherHeader = other.querySelector('.faq-header');
              if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
            }
          });

          // Toggle current
          if (isOpen) {
            item.classList.remove('is-open');
            header.setAttribute('aria-expanded', 'false');
          } else {
            item.classList.add('is-open');
            header.setAttribute('aria-expanded', 'true');
          }
        }

        header.addEventListener('click', (e) => {
          e.preventDefault();
          toggle();
        });

        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });
    }

    bindContainer(desktopSection);
    bindContainer(mobileSection);
  }

  /**
   * Interactive Lead Application Form
   */
  function setupLeadForm() {
    // Enhanced Russian Phone Mask (+7 (XXX) XXX-XX-XX) with complete Backspace/Delete support
    function setupPhoneMask(input, clearErrorCallback) {
      if (!input) return;

      let prevLocalDigits = '';

      function extractLocalDigits(str) {
        if (!str) return '';
        let digits = str.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits[0] === '7' || digits[0] === '8') {
          digits = digits.slice(1);
        }
        return digits.slice(0, 10);
      }

      function formatDigits(digits) {
        if (!digits || digits.length === 0) return '';
        let res = '+7 (';
        res += digits.slice(0, Math.min(3, digits.length));
        if (digits.length >= 3) {
          res += ') ';
        }
        if (digits.length > 3) {
          res += digits.slice(3, Math.min(6, digits.length));
        }
        if (digits.length >= 6) {
          res += '-';
        }
        if (digits.length > 6) {
          res += digits.slice(6, Math.min(8, digits.length));
        }
        if (digits.length >= 8) {
          res += '-';
        }
        if (digits.length > 8) {
          res += digits.slice(8, Math.min(10, digits.length));
        }
        return res;
      }

      function getCursorPosAfterDigits(formatted, k) {
        if (k <= 0) return 4;
        let digitCount = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (i < 2) continue; // skip +7
          if (/\d/.test(formatted[i])) {
            digitCount++;
            if (digitCount === k) return i + 1;
          }
        }
        return formatted.length;
      }

      function countLocalDigitsBefore(str, idx) {
        const slice = str.slice(0, idx);
        const allDigits = slice.replace(/\D/g, '');
        if (allDigits.length === 0) return 0;
        if (allDigits[0] === '7' || allDigits[0] === '8') {
          return allDigits.length - 1;
        }
        return allDigits.length;
      }

      input.addEventListener('keydown', (e) => {
        // Allow navigation & standard control keys
        if (
          e.key === 'Tab' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'Home' ||
          e.key === 'End' ||
          e.ctrlKey ||
          e.metaKey ||
          e.altKey
        ) {
          return;
        }

        const val = input.value;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        let localDigits = extractLocalDigits(val);

        if (e.key === 'Backspace') {
          e.preventDefault();

          // Selection range deletion
          if (start !== end) {
            const digitsBeforeStart = countLocalDigitsBefore(val, start);
            const digitsBeforeEnd = countLocalDigitsBefore(val, end);
            localDigits = localDigits.slice(0, digitsBeforeStart) + localDigits.slice(digitsBeforeEnd);
            if (localDigits.length === 0) {
              input.value = '';
              prevLocalDigits = '';
            } else {
              const formatted = formatDigits(localDigits);
              input.value = formatted;
              prevLocalDigits = localDigits;
              const newPos = getCursorPosAfterDigits(formatted, digitsBeforeStart);
              input.setSelectionRange(newPos, newPos);
            }
            if (clearErrorCallback) clearErrorCallback(input);
            return;
          }

          // Single cursor Backspace
          if (start <= 4) {
            // At or before '+7 (': clear entire input
            input.value = '';
            prevLocalDigits = '';
            if (clearErrorCallback) clearErrorCallback(input);
            return;
          }

          const digitsBefore = countLocalDigitsBefore(val, start);
          if (digitsBefore <= 0) {
            input.value = '';
            prevLocalDigits = '';
            if (clearErrorCallback) clearErrorCallback(input);
            return;
          }

          const removeIdx = digitsBefore - 1;
          localDigits = localDigits.slice(0, removeIdx) + localDigits.slice(removeIdx + 1);

          if (localDigits.length === 0) {
            input.value = '';
            prevLocalDigits = '';
          } else {
            const formatted = formatDigits(localDigits);
            input.value = formatted;
            prevLocalDigits = localDigits;
            const newPos = getCursorPosAfterDigits(formatted, removeIdx);
            input.setSelectionRange(newPos, newPos);
          }
          if (clearErrorCallback) clearErrorCallback(input);
          return;
        }

        if (e.key === 'Delete') {
          e.preventDefault();

          if (start !== end) {
            const digitsBeforeStart = countLocalDigitsBefore(val, start);
            const digitsBeforeEnd = countLocalDigitsBefore(val, end);
            localDigits = localDigits.slice(0, digitsBeforeStart) + localDigits.slice(digitsBeforeEnd);
            if (localDigits.length === 0) {
              input.value = '';
              prevLocalDigits = '';
            } else {
              const formatted = formatDigits(localDigits);
              input.value = formatted;
              prevLocalDigits = localDigits;
              const newPos = getCursorPosAfterDigits(formatted, digitsBeforeStart);
              input.setSelectionRange(newPos, newPos);
            }
            if (clearErrorCallback) clearErrorCallback(input);
            return;
          }

          const digitsBefore = countLocalDigitsBefore(val, start);
          if (digitsBefore >= localDigits.length) {
            return;
          }

          localDigits = localDigits.slice(0, digitsBefore) + localDigits.slice(digitsBefore + 1);
          if (localDigits.length === 0) {
            input.value = '';
            prevLocalDigits = '';
          } else {
            const formatted = formatDigits(localDigits);
            input.value = formatted;
            prevLocalDigits = localDigits;
            const newPos = getCursorPosAfterDigits(formatted, digitsBefore);
            input.setSelectionRange(newPos, newPos);
          }
          if (clearErrorCallback) clearErrorCallback(input);
          return;
        }

        if (/^\d$/.test(e.key)) {
          e.preventDefault();

          // Field is empty or only '+7 ('
          if (!val || localDigits.length === 0) {
            if (e.key === '7' || e.key === '8') {
              input.value = '+7 (';
              prevLocalDigits = '';
              input.setSelectionRange(4, 4);
              return;
            }
            localDigits = e.key;
            const formatted = formatDigits(localDigits);
            input.value = formatted;
            prevLocalDigits = localDigits;
            input.setSelectionRange(formatted.length, formatted.length);
            if (clearErrorCallback) clearErrorCallback(input);
            return;
          }

          // Non-empty field
          const digitsBefore = countLocalDigitsBefore(val, start);
          const digitsAfter = countLocalDigitsBefore(val, end);

          if (start !== end) {
            localDigits = localDigits.slice(0, digitsBefore) + e.key + localDigits.slice(digitsAfter);
          } else {
            if (localDigits.length >= 10 && digitsBefore >= 10) {
              return;
            }
            localDigits = localDigits.slice(0, digitsBefore) + e.key + localDigits.slice(digitsBefore);
          }

          localDigits = localDigits.slice(0, 10);
          const formatted = formatDigits(localDigits);
          input.value = formatted;
          prevLocalDigits = localDigits;
          const newPos = getCursorPosAfterDigits(formatted, digitsBefore + 1);
          input.setSelectionRange(newPos, newPos);
          if (clearErrorCallback) clearErrorCallback(input);
          return;
        }

        if (e.key === '+') {
          e.preventDefault();
          if (!val) {
            input.value = '+7 (';
            prevLocalDigits = '';
            input.setSelectionRange(4, 4);
          }
          return;
        }

        // Block any other non-digit typing
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        if (!pasted) return;

        const digits = extractLocalDigits(pasted);
        if (!digits) {
          input.value = '';
          prevLocalDigits = '';
          return;
        }

        const formatted = formatDigits(digits);
        input.value = formatted;
        prevLocalDigits = digits;
        input.setSelectionRange(formatted.length, formatted.length);
        if (clearErrorCallback) clearErrorCallback(input);
      });

      input.addEventListener('input', (e) => {
        let currentDigits = extractLocalDigits(input.value);

        if (e.inputType === 'deleteContentBackward') {
          if (currentDigits.length === prevLocalDigits.length && currentDigits.length > 0) {
            currentDigits = currentDigits.slice(0, -1);
          }
        }

        if (!currentDigits || currentDigits.length === 0) {
          if (input.value !== '+7 (' && input.value !== '+7') {
            input.value = '';
            prevLocalDigits = '';
          }
          return;
        }

        const formatted = formatDigits(currentDigits);
        input.value = formatted;
        prevLocalDigits = currentDigits;
        input.setSelectionRange(formatted.length, formatted.length);
        if (clearErrorCallback) clearErrorCallback(input);
      });

      input.addEventListener('focus', () => {
        if (!input.value) {
          input.value = '+7 (';
          prevLocalDigits = '';
          setTimeout(() => {
            if (input.value === '+7 (') {
              input.setSelectionRange(4, 4);
            }
          }, 0);
        }
      });

      input.addEventListener('click', () => {
        if (input.value === '+7 (') {
          input.setSelectionRange(4, 4);
        } else if (input.selectionStart < 4 && input.selectionStart === input.selectionEnd) {
          input.setSelectionRange(4, 4);
        }
      });

      input.addEventListener('blur', () => {
        const localDigits = extractLocalDigits(input.value);
        if (!localDigits || localDigits.length === 0) {
          input.value = '';
          prevLocalDigits = '';
        }
      });
    }

    // Bind form controls for a specific form instance
    function bindForm(formId) {
      const form = document.getElementById(formId);
      if (!form) return;

      const phoneInput = form.querySelector('.lead-input-phone');
      const nameInput = form.querySelector('.lead-input-name');
      const telegramInput = form.querySelector('.lead-input-telegram');
      const interestHidden = form.querySelector('input[name="interest"]');
      const selectTrigger = form.querySelector('.form-select-trigger');
      const selectChosen = form.querySelector('.select-chosen');
      const selectDropdown = form.querySelector('.form-select-dropdown');
      const selectOptions = form.querySelectorAll('.form-select-option');
      const submitBtn = form.querySelector('.lead-submit-btn');
      const successCard = form.querySelector('.form-success-card');
      const fieldsContainer = form.querySelector('div[id^="3_"]');
      const resetBtn = form.querySelector('.success-reset-btn');

      // Phone Input Mask
      if (phoneInput) {
        setupPhoneMask(phoneInput, clearError);
      }

      // Name Input
      if (nameInput) {
        nameInput.addEventListener('input', () => {
          clearError(nameInput);
        });
      }

      // Telegram Input
      if (telegramInput) {
        telegramInput.addEventListener('input', () => {
          let clean = telegramInput.value.replace(/^@+/, '').replace(/\s+/g, '');
          telegramInput.value = clean;
          clearError(telegramInput);
        });
      }

      // Custom Select Dropdown
      if (selectTrigger && selectDropdown) {
        selectTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = selectDropdown.classList.contains('is-open');

          document.querySelectorAll('.form-select-dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
          document.querySelectorAll('.form-select-trigger.is-open').forEach((t) => t.classList.remove('is-open'));
          document.querySelectorAll('.lead-form.is-dropdown-open').forEach((f) => f.classList.remove('is-dropdown-open'));

          if (!isOpen) {
            selectDropdown.classList.add('is-open');
            selectTrigger.classList.add('is-open');
            selectTrigger.setAttribute('aria-expanded', 'true');
            form.classList.add('is-dropdown-open');
          }
        });

        selectOptions.forEach((option) => {
          option.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = option.getAttribute('data-value') || option.textContent.trim();
            if (selectChosen) selectChosen.textContent = val;
            if (interestHidden) interestHidden.value = val;

            selectOptions.forEach((opt) => opt.classList.remove('is-selected'));
            option.classList.add('is-selected');

            selectDropdown.classList.remove('is-open');
            selectTrigger.classList.remove('is-open');
            selectTrigger.setAttribute('aria-expanded', 'false');
            form.classList.remove('is-dropdown-open');
          });
        });

        document.addEventListener('click', (e) => {
          if (!selectTrigger.contains(e.target) && !selectDropdown.contains(e.target)) {
            selectDropdown.classList.remove('is-open');
            selectTrigger.classList.remove('is-open');
            selectTrigger.setAttribute('aria-expanded', 'false');
            form.classList.remove('is-dropdown-open');
          }
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            selectDropdown.classList.remove('is-open');
            selectTrigger.classList.remove('is-open');
            selectTrigger.setAttribute('aria-expanded', 'false');
            form.classList.remove('is-dropdown-open');
          }
        });
      }

      // Error Helpers
      function showError(inputEl, msg) {
        const group = inputEl.closest('.form-group');
        if (!group) return;
        group.classList.add('has-error');
        group.classList.remove('shake');
        void group.offsetWidth; // reflow
        group.classList.add('shake');

        const errorMsgEl = group.querySelector('.field-error-msg');
        if (errorMsgEl) errorMsgEl.textContent = msg;
      }

      function clearError(inputEl) {
        const group = inputEl.closest('.form-group');
        if (!group) return;
        group.classList.remove('has-error', 'shake');
        const errorMsgEl = group.querySelector('.field-error-msg');
        if (errorMsgEl) errorMsgEl.textContent = '';
      }

      // Submit Handler
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        let firstInvalid = null;

        // Check Phone (minimum 11 digits)
        const rawDigits = (phoneInput?.value || '').replace(/\D/g, '');
        if (rawDigits.length < 11) {
          showError(phoneInput, 'Введите полный номер телефона');
          isValid = false;
          if (!firstInvalid) firstInvalid = phoneInput;
        } else {
          clearError(phoneInput);
        }

        // Check Name
        const nameVal = (nameInput?.value || '').trim();
        if (nameVal.length < 2) {
          showError(nameInput, 'Укажите ваше имя');
          isValid = false;
          if (!firstInvalid) firstInvalid = nameInput;
        } else {
          clearError(nameInput);
        }

        if (!isValid) {
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        const payload = {
          id: 'lead_' + Date.now(),
          name: nameVal,
          phone: phoneInput.value.trim(),
          telegram: telegramInput?.value ? '@' + telegramInput.value.trim() : '',
          interest: interestHidden?.value || 'Присмотреться к франшизе',
          timestamp: new Date().toISOString()
        };

        // Loading UI
        submitBtn.classList.add('is-loading');
        const labelEl = submitBtn.querySelector('.btn-label');
        const originalText = labelEl ? labelEl.textContent : 'Забрать презентацию';
        if (labelEl) labelEl.textContent = 'Отправка...';

        setTimeout(() => {
          try {
            const saved = JSON.parse(localStorage.getItem('velcore_leads') || '[]');
            saved.push(payload);
            localStorage.setItem('velcore_leads', JSON.stringify(saved));
          } catch (err) {
            console.warn('Storage warning:', err);
          }

          console.log('[VELCORE Lead Submitted]:', payload);

          if (successCard) {
            const descEl = successCard.querySelector('.success-desc');
            if (descEl) {
              const contactMethod = payload.telegram ? `в Telegram (${payload.telegram})` : `по телефону ${payload.phone}`;
              descEl.textContent = `Спасибо, ${payload.name}! В течение рабочего дня мы свяжемся с вами ${contactMethod} и передадим все материалы франшизы.`;
            }

            if (fieldsContainer) fieldsContainer.style.display = 'none';
            submitBtn.style.display = 'none';
            successCard.classList.add('is-visible');
          }

          submitBtn.classList.remove('is-loading');
          if (labelEl) labelEl.textContent = originalText;
        }, 550);
      });

      // Wrapper click to focus input
      form.querySelectorAll('.form-input-wrap').forEach((wrap) => {
        wrap.addEventListener('click', (e) => {
          if (!wrap.classList.contains('form-select-wrap')) {
            const inp = wrap.querySelector('.lead-input');
            if (inp && e.target !== inp) inp.focus();
          }
        });
      });

      // Reset Form Handler
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (phoneInput) phoneInput.value = '';
          if (nameInput) nameInput.value = '';
          if (telegramInput) telegramInput.value = '';
          if (fieldsContainer) fieldsContainer.style.display = '';
          submitBtn.style.display = '';
          if (successCard) successCard.classList.remove('is-visible');
          clearError(phoneInput);
          clearError(nameInput);
        });
      }
    }

    bindForm('desktop-lead-form');
    bindForm('mobile-lead-form');
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupMobileBurger();
    setupCalculator();
    setupAccordion();
    setupLeadForm();
  });

})();
