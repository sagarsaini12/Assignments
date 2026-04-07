/**
 * MANGALAM HDPE PIPES — script.js
 * Handles: Sticky header, image carousel with zoom, application carousel,
 *          manufacturing process steps, FAQ accordion, scroll reveals,
 *          mobile menu, and form interactions.
 */

/* ================================================================
   DOM READY
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initHeroCarousel();
  initApplicationsCarousel();
  initManufacturingSteps();
  initScrollReveal();
  initMobileMenu();
  initFaqAccordion();
  initDropdown();
});

/* ================================================================
   1. STICKY HEADER
   Appears when user scrolls past 80% of the hero section height.
   Hides when user scrolls back up (via IntersectionObserver).
   ================================================================ */
function initStickyHeader() {
  const header    = document.getElementById('stickyHeader');
  const heroSection = document.getElementById('hero');
  if (!header || !heroSection) return;

  let lastScrollY = 0;
  let ticking     = false;

  // Threshold = bottom of hero section
  function handleScroll() {
    const currentY  = window.scrollY;
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

    if (currentY > heroBottom * 0.6) {
      // Past first fold — show header
      header.classList.add('header-visible');
    } else {
      // Back near the top — hide header
      header.classList.remove('header-visible');
    }

    lastScrollY = currentY;
    ticking     = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
}

/* ================================================================
   2. MOBILE MENU TOGGLE
   ================================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ================================================================
   3. DROPDOWN MENU (keyboard accessible)
   ================================================================ */
function initDropdown() {
  const toggle = document.querySelector('.dropdown-toggle');
  const menu   = document.querySelector('.dropdown-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.closest('.nav-dropdown').contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ================================================================
   4. HERO IMAGE CAROUSEL WITH THUMBNAIL ZOOM
   - Carousel slides with prev/next arrows and thumbnail click
   - Hover over a thumbnail → zoomed preview on the main image
   ================================================================ */
function initHeroCarousel() {
  const mainContainer  = document.getElementById('carouselMain');
  const thumbContainer = document.getElementById('carouselThumbnails');
  const prevBtn        = document.getElementById('carouselPrev');
  const nextBtn        = document.getElementById('carouselNext');
  const zoomOverlay    = document.getElementById('zoomOverlay');
  const zoomLens       = document.getElementById('zoomLens');

  if (!mainContainer || !thumbContainer) return;

  // ---- Carousel image data ----
  // 🖼️  REPLACE these src values with your actual product images.
  //      You can place images in the same folder and reference them as:
  //      src: 'images/product-1.jpg'
  const slides = [
    {
      src:  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      alt:  'Workers installing HDPE pipes on industrial platform'
    },
    {
      src:  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
      alt:  'HDPE pipe coil ready for installation'
    },
    {
      src:  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
      alt:  'Construction site with HDPE piping'
    },
    {
      src:  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      alt:  'HDPE fittings and accessories'
    },
    {
      src:  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      alt:  'Quality control inspection of HDPE pipes'
    },
    {
      src:  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
      alt:  'Large diameter HDPE pipe section'
    },
    {
      src:  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
      alt:  'HDPE pipe fusion welding process'
    },
  ];

  let currentIndex = 0;
  let autoPlayTimer = null;

  // Build slides
  slides.forEach((slideData, i) => {
    const div = document.createElement('div');
    div.className = 'carousel-slide' + (i === 0 ? ' active' : '');
    div.setAttribute('role', 'tabpanel');
    div.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);

    const img = document.createElement('img');
    img.src     = slideData.src;
    img.alt     = slideData.alt;
    img.loading = i === 0 ? 'eager' : 'lazy';

    div.appendChild(img);
    mainContainer.appendChild(div);
  });

  // Build thumbnails
  slides.forEach((slideData, i) => {
    const thumb = document.createElement('div');
    thumb.className  = 'carousel-thumb' + (i === 0 ? ' active' : '');
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('aria-label', `Thumbnail ${i + 1}`);
    thumb.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    thumb.setAttribute('tabindex', i === 0 ? '0' : '-1');

    const img = document.createElement('img');
    img.src     = slideData.src;
    img.alt     = `Thumbnail for slide ${i + 1}`;
    img.loading = 'lazy';

    thumb.appendChild(img);
    thumbContainer.appendChild(thumb);

    // Click to go to slide
    thumb.addEventListener('click', () => goToSlide(i));

    // ---- ZOOM FUNCTIONALITY ----
    // When hovering a thumbnail, the main image zooms to show
    // the hovered thumbnail's content inside the main carousel area.
    thumb.addEventListener('mouseenter', () => activateZoom(i, thumb));
    thumb.addEventListener('mousemove', (e) => moveZoomLens(e, thumb, i));
    thumb.addEventListener('mouseleave', () => deactivateZoom());

    // Keyboard navigation
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToSlide(i); }
      if (e.key === 'ArrowRight') goToSlide((i + 1) % slides.length);
      if (e.key === 'ArrowLeft')  goToSlide((i - 1 + slides.length) % slides.length);
    });
  });

  /** Switch to a specific slide */
  function goToSlide(index) {
    const allSlides = mainContainer.querySelectorAll('.carousel-slide');
    const allThumbs = thumbContainer.querySelectorAll('.carousel-thumb');

    // Deactivate previous
    allSlides[currentIndex].classList.remove('active');
    allThumbs[currentIndex].classList.remove('active');
    allThumbs[currentIndex].setAttribute('aria-selected', 'false');
    allThumbs[currentIndex].setAttribute('tabindex', '-1');

    currentIndex = (index + slides.length) % slides.length;

    // Activate new
    allSlides[currentIndex].classList.add('active');
    allThumbs[currentIndex].classList.add('active');
    allThumbs[currentIndex].setAttribute('aria-selected', 'true');
    allThumbs[currentIndex].setAttribute('tabindex', '0');

    // Scroll thumbnail into view
    allThumbs[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', () => { resetAutoPlay(); goToSlide(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', () => { resetAutoPlay(); goToSlide(currentIndex + 1); });

  // Auto-play every 4 seconds
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => goToSlide(currentIndex + 1), 4000);
  }
  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }
  startAutoPlay();

  // Pause auto-play on hover
  mainContainer.closest('.carousel-section').addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
  mainContainer.closest('.carousel-section').addEventListener('mouseleave', startAutoPlay);

  // Swipe support for touch devices
  let touchStartX = 0;
  mainContainer.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  mainContainer.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  });

  /* ---- ZOOM IMPLEMENTATION ----
     On thumbnail hover, a zoomed preview (lens) floats over the
     corresponding main slide image, showing a magnified region
     that follows the cursor position within the thumbnail.
  */
  function activateZoom(slideIndex, thumbEl) {
    if (!zoomOverlay || !zoomLens) return;

    // Get the image src for this slide
    const imgSrc = slides[slideIndex].src;

    // Get main carousel wrapper size
    const wrapperEl = document.querySelector('.carousel-main-wrapper');
    if (!wrapperEl) return;

    const wRect = wrapperEl.getBoundingClientRect();
    const lensW = 160, lensH = 120;

    // Apply the zoomed image as background on the lens
    // The zoom level: 2.5× magnification
    const zoomScale = 2.5;
    zoomLens.style.width            = lensW + 'px';
    zoomLens.style.height           = lensH + 'px';
    zoomLens.style.backgroundImage  = `url('${imgSrc}')`;
    zoomLens.style.backgroundSize   = `${wRect.width * zoomScale}px ${wRect.height * zoomScale}px`;
    zoomLens.style.backgroundRepeat = 'no-repeat';

    zoomOverlay.classList.add('visible');
    zoomOverlay.setAttribute('aria-hidden', 'false');
  }

  function moveZoomLens(event, thumbEl, slideIndex) {
    if (!zoomOverlay || !zoomLens) return;

    const wrapperEl = document.querySelector('.carousel-main-wrapper');
    if (!wrapperEl) return;

    const wRect  = wrapperEl.getBoundingClientRect();
    const tRect  = thumbEl.getBoundingClientRect();
    const lensW  = 160, lensH = 120;
    const zoomScale = 2.5;

    // Calculate cursor position relative to the thumbnail
    const relX = (event.clientX - tRect.left) / tRect.width;   // 0–1
    const relY = (event.clientY - tRect.top)  / tRect.height;  // 0–1

    // Position the lens centered on cursor inside the main wrapper
    let lensLeft = (relX * wRect.width) - lensW / 2;
    let lensTop  = (relY * wRect.height) - lensH / 2;

    // Clamp lens within the wrapper
    lensLeft = Math.max(0, Math.min(lensLeft, wRect.width  - lensW));
    lensTop  = Math.max(0, Math.min(lensTop,  wRect.height - lensH));

    zoomLens.style.left = lensLeft + 'px';
    zoomLens.style.top  = lensTop  + 'px';

    // Pan the background so the zoom follows the cursor proportionally
    const bgX = -(relX * wRect.width  * zoomScale - lensW / 2);
    const bgY = -(relY * wRect.height * zoomScale - lensH / 2);
    zoomLens.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }

  function deactivateZoom() {
    if (!zoomOverlay) return;
    zoomOverlay.classList.remove('visible');
    zoomOverlay.setAttribute('aria-hidden', 'true');
  }
}

/* ================================================================
   5. APPLICATIONS CAROUSEL (horizontal scroll with prev/next)
   ================================================================ */
function initApplicationsCarousel() {
  const carousel  = document.getElementById('applicationsCarousel');
  const prevBtn   = document.getElementById('appPrev');
  const nextBtn   = document.getElementById('appNext');
  if (!carousel || !prevBtn || !nextBtn) return;

  let offset = 0;
  const cards = carousel.querySelectorAll('.app-card');
  if (!cards.length) return;

  // Each card is 50% of container minus the gap; scroll by one card width
  function getCardWidth() {
    return cards[0].offsetWidth + 20; // 20px = gap
  }

  function updateCarousel() {
    carousel.style.transform = `translateX(-${offset}px)`;
  }

  nextBtn.addEventListener('click', () => {
    const maxOffset = getCardWidth() * (cards.length - 2);
    offset = Math.min(offset + getCardWidth(), maxOffset);
    updateCarousel();
  });

  prevBtn.addEventListener('click', () => {
    offset = Math.max(offset - getCardWidth(), 0);
    updateCarousel();
  });

  // Touch swipe
  let startX = 0;
  carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend',   (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextBtn.click();
      else           prevBtn.click();
    }
  });
}

/* ================================================================
   6. MANUFACTURING PROCESS STEPS (prev/next stepper)
   ================================================================ */
function initManufacturingSteps() {
  const prevBtn      = document.getElementById('stepPrev');
  const nextBtn      = document.getElementById('stepNext');
  const stepBadge    = document.getElementById('stepBadge');
  const stepTitle    = document.getElementById('stepTitle');
  const stepDesc     = document.getElementById('stepDesc');
  const stepPoints   = document.getElementById('stepPoints');
  const stepImage    = document.getElementById('stepImage');
  const progressBar  = document.getElementById('stepProgressBar');

  if (!prevBtn || !nextBtn) return;

  // ---- Step data ----
  // 🖼️  Replace image src values with your actual manufacturing process images.
  const steps = [
    {
      badge:  'Step 1/8: Raw Material',
      title:  'High-Grade Raw Material Selection',
      desc:   'Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.',
      points: ['PE100 grade material', 'Optimal molecular weight distribution'],
      img:    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      imgAlt: 'Raw material selection for HDPE pipes'
    },
    {
      badge:  'Step 2/8: Extrusion',
      title:  'High-Precision Extrusion Process',
      desc:   'State-of-the-art extruders melt and homogenise the HDPE compound, forcing it through a precision die to form continuous pipe profiles.',
      points: ['Controlled melt temperature', 'Uniform material distribution'],
      img:    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
      imgAlt: 'HDPE extrusion process'
    },
    {
      badge:  'Step 3/8: Vacuum Sizing',
      title:  'Vacuum Sizing & Cooling',
      desc:   'Vacuum tanks precisely calibrate the outer diameter while haul-off units maintain consistent wall thickness throughout production.',
      points: ['Precise outer diameter control', 'Wall thickness uniformity'],
      img:    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
      imgAlt: 'Vacuum sizing tank'
    },
    {
      badge:  'Step 4/8: Quality Testing',
      title:  'In-Line Quality Testing',
      desc:   'Ultrasonic wall thickness gauges and diameter scanners provide continuous monitoring of dimensional accuracy during production.',
      points: ['Ultrasonic wall thickness measurement', 'Real-time diameter scanning'],
      img:    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      imgAlt: 'Quality testing equipment'
    },
    {
      badge:  'Step 5/8: Printing',
      title:  'Identification Marking & Printing',
      desc:   'Inkjet printing systems apply permanent identification marks including pipe size, pressure rating, material grade, and certification details.',
      points: ['Permanent inkjet printing', 'Certification details marked'],
      img:    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      imgAlt: 'Pipe printing and marking'
    },
    {
      badge:  'Step 6/8: Cutting',
      title:  'Precision Cutting to Length',
      desc:   'Automated cutters produce clean, square pipe ends at precise lengths, ready for coiling or straight-length packaging.',
      points: ['Automated cutting systems', 'Clean, square pipe ends'],
      img:    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
      imgAlt: 'Precision pipe cutting'
    },
    {
      badge:  'Step 7/8: Coiling',
      title:  'Coiling for Smaller Diameters',
      desc:   'For pipes up to 110mm diameter, automatic coiling machines wind the pipe onto reels for convenient transport and installation.',
      points: ['Automatic coiling machines', 'Available up to 110mm diameter'],
      img:    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
      imgAlt: 'Pipe coiling operation'
    },
    {
      badge:  'Step 8/8: Final Inspection',
      title:  'Final Quality Inspection & Dispatch',
      desc:   'Every batch undergoes hydrostatic pressure testing and dimensional verification before receiving certification and shipping approval.',
      points: ['Hydrostatic pressure testing', 'Certification and dispatch approval'],
      img:    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      imgAlt: 'Final quality inspection'
    }
  ];

  let currentStep = 0;
  const totalSteps = steps.length;

  function renderStep(index) {
    const step = steps[index];
    const card = document.getElementById('processCard');
    if (!card) return;

    // Animate out
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(12px)';

    setTimeout(() => {
      stepBadge.textContent = step.badge;
      stepTitle.textContent = step.title;
      stepDesc.textContent  = step.desc;

      // Rebuild bullet points
      stepPoints.innerHTML = step.points.map(p =>
        `<li><span class="check-icon blue">&#10003;</span> ${p}</li>`
      ).join('');

      if (stepImage) {
        stepImage.src = step.img;
        stepImage.alt = step.imgAlt;
      }

      // Update progress bar (percentage)
      const pct = ((index + 1) / totalSteps) * 100;
      if (progressBar) progressBar.style.width = pct + '%';

      // Prev/Next button states
      prevBtn.disabled = (index === 0);
      nextBtn.disabled = (index === totalSteps - 1);

      // Animate in
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 180);
  }

  // Add transition style to process card
  const card = document.getElementById('processCard');
  if (card) {
    card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      renderStep(currentStep);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
    }
  });

  // Initial render
  renderStep(0);
}

/* ================================================================
   7. SCROLL REVEAL (Intersection Observer)
   ================================================================ */
function initScrollReveal() {
  // Add .reveal class to key elements
  const targets = document.querySelectorAll(
    '.feature-card, .testimonial-card, .portfolio-card, .specs-table-wrapper, ' +
    '.resource-row, .faq-item, .app-card, .price-card, .cert-badges, .hero-title'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger delays for grid siblings
    if (i % 4 === 1) el.classList.add('reveal-delay-1');
    if (i % 4 === 2) el.classList.add('reveal-delay-2');
    if (i % 4 === 3) el.classList.add('reveal-delay-3');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Animate once only
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

/* ================================================================
   8. FAQ ACCORDION (details/summary native elements)
   Ensure only one FAQ is open at a time and update icons.
   ================================================================ */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      const icon = item.querySelector('.faq-icon');
      if (!icon) return;

      if (item.open) {
        icon.innerHTML = '&#8679;'; // Up arrow
        // Close other open items
        faqItems.forEach(other => {
          if (other !== item && other.open) other.removeAttribute('open');
        });
      } else {
        icon.innerHTML = '&#8681;'; // Down arrow
      }
    });
  });
}