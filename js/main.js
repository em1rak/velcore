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
      market: { desktop: '3_71', mobile: '3_504' },
      calc: { desktop: '3_137', mobile: '3_570' },
      tariffs: { desktop: '3_197', mobile: '3_630' },
      faq: { desktop: '3_307', mobile: '3_740' },
      form: { desktop: '3_364', mobile: '3_745' }
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
    // Russian Phone Formatter (+7 (XXX) XXX-XX-XX)
    function formatPhone(val) {
      if (!val) return '';
      let digits = val.replace(/\D/g, '');
      if (digits.length === 0) return '';

      // If user started with 8 or 7, strip the first digit
      if (digits[0] === '8' || digits[0] === '7') {
        digits = digits.substring(1);
      }

      digits = digits.substring(0, 10);

      let formatted = '+7 (';
      if (digits.length > 0) {
        formatted += digits.substring(0, 3);
      }
      if (digits.length >= 3) {
        formatted += ') ' + digits.substring(3, 6);
      } else if (digits.length > 0) {
        return formatted;
      }
      if (digits.length >= 6) {
        formatted += '-' + digits.substring(6, 8);
      }
      if (digits.length >= 8) {
        formatted += '-' + digits.substring(8, 10);
      }
      return formatted;
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
        phoneInput.addEventListener('input', () => {
          phoneInput.value = formatPhone(phoneInput.value);
          clearError(phoneInput);
        });

        phoneInput.addEventListener('focus', () => {
          if (!phoneInput.value) {
            phoneInput.value = '+7 (';
          }
        });

        phoneInput.addEventListener('blur', () => {
          if (phoneInput.value === '+7 (' || phoneInput.value === '+7') {
            phoneInput.value = '';
          }
        });
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
    setupCalculator();
    setupAccordion();
    setupLeadForm();
  });

})();
