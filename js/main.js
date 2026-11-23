/**
 * Loan Anchor Financing Brokers LLC - Main Frontend Script
 * Handles mobile navigation, AJAX forms, FAQ accordions, certification slider, and UI interactivity.
 */

(function () {
  'use strict';

  var TARGET_EMAIL = 'info@loananchor.ae';
  var PRIMARY_ENDPOINT = 'https://formsubmit.co/ajax/' + TARGET_EMAIL;
  var FALLBACK_ENDPOINT = 'send-enquiry.php';
  var PHONE = '0525221369';

  /* ==========================================================================
     1. Mobile Navigation Toggle
     ========================================================================== */
  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    var burgerIcon = document.getElementById('burger-icon');
    var closeIcon = document.getElementById('close-icon');

    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      var isExpanded = btn.getAttribute('aria-expanded') === 'true';
      var willOpen = !isExpanded;

      btn.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) {
        menu.classList.remove('hidden');
        if (burgerIcon) burgerIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      } else {
        menu.classList.add('hidden');
        if (burgerIcon) burgerIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      }
    });

    // Close when a link inside mobile menu is clicked
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        if (burgerIcon) burgerIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      });
    });
  }

  /* ==========================================================================
     2. Reusable AJAX Form Handler (Home Enquiry & Contact Form)
     ========================================================================== */
  function initForms() {
    var forms = document.querySelectorAll('form[data-ajax-form="true"], form#enquiry, form#contact-form');

    forms.forEach(function (form) {
      var statusBox = form.querySelector('.form-status') || form.querySelector('#ok');
      var submitBtn = form.querySelector('button[type="submit"]');
      var defaultBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validation
        var isValid = true;
        var requiredInputs = form.querySelectorAll('[required]');

        requiredInputs.forEach(function (field) {
          var val = field.value.trim();
          var fieldValid = true;

          if (val === '') {
            fieldValid = false;
          } else if (field.type === 'email') {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            fieldValid = emailPattern.test(val);
          } else if (field.type === 'tel') {
            fieldValid = val.length >= 7;
          }

          if (!fieldValid) {
            field.classList.add('border-red-500', 'ring-1', 'ring-red-500');
            field.classList.remove('border-stone-200', 'border-gray-300');
            isValid = false;
          } else {
            field.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
            field.classList.add('border-stone-200');
          }
        });

        if (!isValid) {
          if (statusBox) {
            statusBox.textContent = 'Please fill in all required fields accurately.';
            statusBox.className = 'form-status text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-md mt-3 block text-center';
            statusBox.style.display = 'block';
          }
          return;
        }

        // Submitting state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Sending...';
        }
        if (statusBox) {
          statusBox.style.display = 'none';
        }

        var formData = new FormData(form);

        var nameVal = (formData.get('name') || '').toString().trim();
        var emailVal = (formData.get('email') || '').toString().trim();
        var phoneVal = (formData.get('phone') || '').toString().trim();
        var salaryVal = (formData.get('salary') || '').toString().trim();
        var serviceVal = (formData.get('service') || 'General Financing Inquiry').toString().trim();
        var messageVal = (formData.get('message') || '').toString().trim();

        if (salaryVal) {
          messageVal = 'Salary / Income: ' + salaryVal + (messageVal ? '\n' + messageVal : '');
        }

        // Construct structured payload for direct email delivery
        var payload = {
          name: nameVal,
          email: emailVal || 'client-enquiry@loananchor.ae',
          phone: phoneVal,
          salary: salaryVal,
          service: serviceVal,
          message: messageVal || ('Consultation enquiry for ' + serviceVal),
          _subject: 'New Loan Anchor Enquiry - ' + serviceVal + ' (' + nameVal + ')',
          _template: 'table',
          _captcha: 'false',
          _replyto: emailVal || 'info@loananchor.ae'
        };

        function resetButton() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = defaultBtnText;
          }
        }

        function handleSuccess(msg) {
          // Prevent raw FormSubmit system messages (e.g. activation prompts) from confusing the user
          var userMessage = 'Thank you! Your enquiry has been received. Our team will contact you shortly.';
          if (msg && typeof msg === 'string' && msg.indexOf('Activation') === -1 && msg.indexOf('activate') === -1 && msg.indexOf('FormSubmit') === -1) {
            userMessage = msg;
          }
          if (statusBox) {
            statusBox.textContent = userMessage;
            statusBox.className = 'form-status text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-md mt-3 block text-center';
            statusBox.style.display = 'block';
          }
          form.reset();
          resetButton();

          // Report asynchronously to local PHP backend if available to persist in enquiries.log
          try {
            fetch(FALLBACK_ENDPOINT, {
              method: 'POST',
              body: formData
            }).catch(function () { });
          } catch (err) { }
        }

        function handleFailure() {
          if (statusBox) {
            statusBox.textContent = 'Unable to send enquiry. Please contact us directly at ' + PHONE + ' or info@loananchor.ae.';
            statusBox.className = 'form-status text-xs font-semibold text-red-600 bg-red-50 border border-red-200 p-3 rounded-md mt-3 block text-center';
            statusBox.style.display = 'block';
          }
          resetButton();
        }

        function submitNativeFormSubmit() {
          form.action = 'https://formsubmit.co/' + TARGET_EMAIL;
          form.method = 'POST';
          var nextField = form.querySelector('input[name="_next"]');
          if (!nextField) {
            nextField = document.createElement('input');
            nextField.type = 'hidden';
            nextField.name = '_next';
            form.appendChild(nextField);
          }
          nextField.value = window.location.href.split('?')[0] + '?submitted=true';
          form.submit();
        }

        function tryFormSubmitAjax() {
          fetch(PRIMARY_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          })
            .then(function (response) {
              return response.json().then(function (data) {
                return { status: response.status, ok: response.ok, body: data };
              }).catch(function () {
                return { status: response.status, ok: response.ok, body: {} };
              });
            })
            .then(function (res) {
              if (res.ok && (res.body.success === 'true' || res.body.success === true || res.status === 200)) {
                handleSuccess(res.body.message);
              } else {
                submitNativeFormSubmit();
              }
            })
            .catch(function () {
              submitNativeFormSubmit();
            });
        }

        var isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';

        if (isHttp) {
          fetch(FALLBACK_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          })
            .then(function (response) {
              return response.json().then(function (data) {
                return { status: response.status, ok: response.ok, body: data };
              }).catch(function () {
                return { status: response.status, ok: response.ok, body: {} };
              });
            })
            .then(function (res) {
              if (res.ok && res.body.ok) {
                handleSuccess(res.body.message);
              } else {
                tryFormSubmitAjax();
              }
            })
            .catch(function () {
              tryFormSubmitAjax();
            });
        } else {
          tryFormSubmitAjax();
        }
      });
    });

    // Check if redirected after native submission
    if (window.location.search.indexOf('submitted=true') !== -1 || window.location.search.indexOf('status=success') !== -1) {
      forms.forEach(function (f) {
        var sb = f.querySelector('.form-status') || f.querySelector('#ok');
        if (sb) {
          sb.textContent = 'Thank you! Your enquiry has been received. Our team will contact you shortly.';
          sb.className = 'form-status text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-md mt-3 block text-center';
          sb.style.display = 'block';
        }
      });
    }
  }

  /* ==========================================================================
     3. Services Interactive Selector (Home Page)
     ========================================================================== */
  function initServiceSwitcher() {
    var buttons = document.querySelectorAll('#svcList li button');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#svcList li').forEach(function (li) {
          li.classList.remove('bg-white/10', 'border-gold', 'text-gold');
          li.classList.add('border-white/15', 'text-white');
          var arrowCircle = li.querySelector('.svc-arrow-circle');
          if (arrowCircle) {
            arrowCircle.classList.remove('bg-gold', 'text-navy');
            arrowCircle.classList.add('bg-white/10', 'text-white');
          }
        });

        var parentLi = btn.closest('li');
        if (parentLi) {
          parentLi.classList.add('bg-white/10', 'border-gold', 'text-gold');
          parentLi.classList.remove('border-white/15', 'text-white');
          var arrowCircle = parentLi.querySelector('.svc-arrow-circle');
          if (arrowCircle) {
            arrowCircle.classList.add('bg-gold', 'text-navy');
            arrowCircle.classList.remove('bg-white/10', 'text-white');
          }
        }
      });
    });
  }

  /* ==========================================================================
     4. FAQ Accordion (Services & FAQ sections)
     ========================================================================== */
  function initAccordion() {
    var accordionItems = document.querySelectorAll('.faq-item');
    if (!accordionItems.length) return;

    accordionItems.forEach(function (item) {
      var header = item.querySelector('.faq-header');
      var body = item.querySelector('.faq-body');
      var icon = item.querySelector('.faq-icon');

      if (!header || !body) return;

      header.addEventListener('click', function () {
        var isOpen = !body.classList.contains('hidden');

        // Close other items
        accordionItems.forEach(function (other) {
          var otherBody = other.querySelector('.faq-body');
          var otherIcon = other.querySelector('.faq-icon');
          if (otherBody) otherBody.classList.add('hidden');
          if (otherIcon) {
            otherIcon.textContent = '+';
            otherIcon.classList.remove('rotate-45');
          }
        });

        if (!isOpen) {
          body.classList.remove('hidden');
          if (icon) {
            icon.textContent = '—';
            icon.classList.add('rotate-0');
          }
        }
      });
    });
  }

  /* ==========================================================================
     5. Certifications & Licensing Carousel / Slider (Home Page)
     ========================================================================== */
  function initCertSlider() {
    var track = document.getElementById('track') || document.querySelector('.cert-track');
    if (!track) return;

    var prevBtn = document.getElementById('prev');
    var nextBtn = document.getElementById('next');
    var thumb = document.getElementById('thumb');
    var trackBar = document.getElementById('track-bar') || (thumb ? thumb.parentElement : null);

    // Calculate dynamic step (one card + gap)
    function getCardStep() {
      var firstCard = track.children[0];
      if (!firstCard) return 260;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap) || 20;
      return firstCard.offsetWidth + gap;
    }

    // Update progress bar
    function updateThumb() {
      if (!thumb || !trackBar) return;
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) {
        thumb.style.width = '100%';
        thumb.style.transform = 'translateX(0)';
        trackBar.setAttribute('aria-valuenow', '100');
        return;
      }
      var progress = Math.max(0, Math.min(1, track.scrollLeft / maxScroll));
      var barWidth = trackBar.clientWidth;
      var thumbWidth = Math.max(36, barWidth * (track.clientWidth / track.scrollWidth));
      thumb.style.width = thumbWidth + 'px';
      thumb.style.transform = 'translateX(' + (progress * (barWidth - thumbWidth)) + 'px)';
      trackBar.setAttribute('aria-valuenow', Math.round(progress * 100));
    }

    // Scroll Next with seamless wrap-around
    function scrollNext() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      var step = getCardStep();
      if (track.scrollLeft >= maxScroll - 15) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: step, behavior: 'smooth' });
      }
    }

    // Scroll Prev with seamless wrap-around
    function scrollPrev() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      var step = getCardStep();
      if (track.scrollLeft <= 15) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        scrollPrev();
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        scrollNext();
        restartAutoplay();
      });
    }

    // Click on progress bar to seek
    if (trackBar) {
      trackBar.addEventListener('click', function (e) {
        var rect = trackBar.getBoundingClientRect();
        var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        var maxScroll = track.scrollWidth - track.clientWidth;
        track.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
        restartAutoplay();
      });
    }

    // Mouse Drag-to-Scroll (Desktop)
    var isDown = false;
    var startX = 0;
    var scrollLeftStart = 0;
    var hasMoved = false;

    track.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isDown = true;
      hasMoved = false;
      startX = e.pageX - track.offsetLeft;
      scrollLeftStart = track.scrollLeft;
      track.classList.add('cursor-grabbing');
      track.classList.remove('cursor-grab', 'scroll-smooth');
      stopAutoplay();
    });

    window.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('cursor-grabbing');
      track.classList.add('cursor-grab', 'scroll-smooth');
      restartAutoplay();
    });

    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.25;
      if (Math.abs(walk) > 4) hasMoved = true;
      track.scrollLeft = scrollLeftStart - walk;
    });

    // Suppress click on slides if user was dragging
    track.addEventListener('click', function (e) {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved = false;
      }
    }, true);

    // Keyboard Arrow Navigation
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
        restartAutoplay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
        restartAutoplay();
      }
    });

    // Autoplay (every 3.5s) with pause-on-hover / pause-on-touch
    var autoplayInterval = null;
    function startAutoplay() {
      if (autoplayInterval) return;
      autoplayInterval = setInterval(function () {
        if (document.hidden) return;
        scrollNext();
      }, 3500);
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      setTimeout(startAutoplay, 2500);
    }

    var sliderSection = track.closest('section') || track.parentElement;
    if (sliderSection) {
      sliderSection.addEventListener('mouseenter', stopAutoplay);
      sliderSection.addEventListener('mouseleave', startAutoplay);
    }

    track.addEventListener('touchstart', stopAutoplay, { passive: true });
    track.addEventListener('touchend', restartAutoplay, { passive: true });

    track.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);

    // Initial thumb update & start autoplay
    setTimeout(function () {
      updateThumb();
      startAutoplay();
    }, 150);
  }

  /* ==========================================================================
     6. Footer Mobile Accordion
     ========================================================================== */
  function initFooterAccordion() {
    var buttons = document.querySelectorAll('.footer-acc-btn');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var content = this.nextElementSibling;
        var icon = this.querySelector('.footer-acc-icon');
        if (!content) return;

        var isHidden = content.classList.contains('hidden');
        if (isHidden) {
          content.classList.remove('hidden');
          if (icon) icon.textContent = '—';
          btn.setAttribute('aria-expanded', 'true');
        } else {
          content.classList.add('hidden');
          if (icon) icon.textContent = '+';
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ==========================================================================
     7. Mobile Services Carousel (services.html)
     ========================================================================== */
  function initMobileServicesSlider() {
    var prevBtn = document.getElementById('svc-mob-prev');
    var nextBtn = document.getElementById('svc-mob-next');
    var slides = document.querySelectorAll('.svc-mob-slide');
    if (!slides.length || !prevBtn || !nextBtn) return;

    var currentIndex = 0;

    function showSlide(idx) {
      if (idx < 0) idx = slides.length - 1;
      if (idx >= slides.length) idx = 0;
      currentIndex = idx;
      slides.forEach(function (s, i) {
        if (i === currentIndex) {
          s.classList.remove('hidden');
        } else {
          s.classList.add('hidden');
        }
      });
    }

    prevBtn.addEventListener('click', function () {
      showSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function () {
      showSlide(currentIndex + 1);
    });
  }

  /* ==========================================================================
     8. Mobile About Approach & Partners Swiper (index.html & about.html)
     ========================================================================== */
  function initApproachSwiper() {
    var swipers = document.querySelectorAll('.approach-swiper, #approach-swiper');
    if (!swipers.length) return;

    swipers.forEach(function (swiper) {
      var track = swiper.querySelector('#approach-track, .approach-track');
      var container = swiper.closest('.block') || swiper.parentElement;
      var dots = container ? container.querySelectorAll('.approach-dot') : [];
      if (!track || !dots.length) return;

      var currentIndex = 0;
      var totalSlides = dots.length;

      function goToSlide(idx) {
        if (idx < 0) idx = 0;
        if (idx >= totalSlides) idx = totalSlides - 1;
        currentIndex = idx;
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        dots.forEach(function (dot, i) {
          if (i === currentIndex) {
            dot.classList.remove('bg-stone-300');
            dot.classList.add('bg-gold');
          } else {
            dot.classList.remove('bg-gold');
            dot.classList.add('bg-stone-300');
          }
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index') || '0', 10);
          goToSlide(idx);
        });
      });

      // Touch swipe support
      var startX = 0;
      var moveX = 0;
      swiper.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        moveX = startX;
      }, { passive: true });

      swiper.addEventListener('touchmove', function (e) {
        moveX = e.touches[0].clientX;
      }, { passive: true });

      swiper.addEventListener('touchend', function () {
        var diff = startX - moveX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            goToSlide(currentIndex + 1);
          } else {
            goToSlide(currentIndex - 1);
          }
        }
      });

      // Auto rotate every 4.5s
      setInterval(function () {
        if (document.hidden) return;
        var next = (currentIndex + 1) % totalSlides;
        goToSlide(next);
      }, 4500);
    });
  }

  /* ==========================================================================
     8b. Mobile Experience Swiper (about.html)
     Displays ~1.18 cards at a time (w-[85%]) with smooth swiping, dots & arrows
     ========================================================================== */
  function initExperienceSwiper() {
    var section = document.getElementById('mobile-experience');
    if (!section) return;

    var track = section.querySelector('#exp-track');
    var slides = section.querySelectorAll('.exp-slide');
    var dots = section.querySelectorAll('.exp-dot');
    var prevBtn = section.querySelector('#exp-prev-btn');
    var nextBtn = section.querySelector('#exp-next-btn');
    var swiper = section.querySelector('#exp-swiper');
    if (!track || !slides.length) return;

    var currentIndex = 0;
    var totalSlides = slides.length;

    function goToSlide(idx) {
      if (idx < 0) idx = 0;
      if (idx >= totalSlides) idx = totalSlides - 1;
      currentIndex = idx;

      // Each slide is 85% width
      track.style.transform = 'translateX(-' + (currentIndex * 85) + '%)';

      dots.forEach(function (dot, i) {
        if (i === currentIndex) {
          dot.classList.remove('w-2', 'bg-white/40');
          dot.classList.add('w-6', 'bg-gold');
        } else {
          dot.classList.remove('w-6', 'bg-gold');
          dot.classList.add('w-2', 'bg-white/40');
        }
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index') || '0', 10);
        goToSlide(idx);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
      });
    }

    // Touch swipe support
    if (swiper) {
      var startX = 0;
      var moveX = 0;
      swiper.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        moveX = startX;
      }, { passive: true });

      swiper.addEventListener('touchmove', function (e) {
        moveX = e.touches[0].clientX;
      }, { passive: true });

      swiper.addEventListener('touchend', function () {
        var diff = startX - moveX;
        if (Math.abs(diff) > 35) {
          if (diff > 0) {
            goToSlide(currentIndex + 1);
          } else {
            goToSlide(currentIndex - 1);
          }
        }
      });
    }
  }

  /* ==========================================================================
     8c. Mobile Customer Expectations Swiper (about.html)
     Converts the 5 customer expectations into a smooth mobile swiper
     ========================================================================== */
  function initExpectationsSwiper() {
    var wrapper = document.getElementById('expect-mobile-wrapper');
    if (!wrapper) return;

    var track = wrapper.querySelector('#expect-track');
    var slides = wrapper.querySelectorAll('.expect-slide');
    var dots = wrapper.querySelectorAll('.expect-dot');
    var prevBtn = wrapper.querySelector('#expect-prev-btn');
    var nextBtn = wrapper.querySelector('#expect-next-btn');
    var swiper = wrapper.querySelector('#expect-swiper');
    if (!track || !slides.length) return;

    var currentIndex = 0;
    var totalSlides = slides.length;

    function goToSlide(idx) {
      if (idx < 0) idx = totalSlides - 1;
      if (idx >= totalSlides) idx = 0;
      currentIndex = idx;

      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

      dots.forEach(function (dot, i) {
        if (i === currentIndex) {
          dot.classList.remove('w-1.5', 'bg-stone-300');
          dot.classList.add('w-5', 'bg-gold');
        } else {
          dot.classList.remove('w-5', 'bg-gold');
          dot.classList.add('w-1.5', 'bg-stone-300');
        }
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index') || '0', 10);
        goToSlide(idx);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
      });
    }

    // Touch swipe support
    if (swiper) {
      var startX = 0;
      var moveX = 0;
      swiper.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        moveX = startX;
      }, { passive: true });

      swiper.addEventListener('touchmove', function (e) {
        moveX = e.touches[0].clientX;
      }, { passive: true });

      swiper.addEventListener('touchend', function () {
        var diff = startX - moveX;
        if (Math.abs(diff) > 35) {
          if (diff > 0) {
            goToSlide(currentIndex + 1);
          } else {
            goToSlide(currentIndex - 1);
          }
        }
      });
    }

    // Auto rotate every 4.5 seconds
    setInterval(function () {
      if (document.hidden) return;
      goToSlide(currentIndex + 1);
    }, 4500);
  }

  /* ==========================================================================
     9. Smooth In-Page & Cross-Page Anchor Navigation
     ========================================================================== */
  function initAnchorScroll() {
    function scrollToHash(hash) {
      if (!hash || hash === '#' || hash.indexOf('javascript:') === 0) return;
      var target = document.querySelector(hash);
      if (target) {
        var headerOffset = 90;
        var elementPosition = target.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }

    if (window.location.hash) {
      setTimeout(function () {
        scrollToHash(window.location.hash);
      }, 250);
    }

    document.querySelectorAll('a[href*="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#' || href.indexOf('javascript:') === 0) return;

        var hashIdx = href.indexOf('#');
        if (hashIdx === -1) return;

        var path = href.substring(0, hashIdx);
        var hash = href.substring(hashIdx);
        var curPath = window.location.pathname.split('/').pop() || 'index.html';

        if (path === '' || path === curPath) {
          e.preventDefault();
          scrollToHash(hash);
          if (history.pushState) {
            history.pushState(null, null, hash);
          }
        }
      });
    });
  }

  /* ==========================================================================
     Initialize on DOM Ready
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initForms();
    initServiceSwitcher();
    initAccordion();
    initCertSlider();
    initFooterAccordion();
    initMobileServicesSlider();
    initApproachSwiper();
    initExperienceSwiper();
    initExpectationsSwiper();
    initAnchorScroll();
  });

})();
