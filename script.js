// ---------- Envelope open ----------
  const envelope = document.getElementById('envelope');
  const envScreen = document.getElementById('envelope-screen');
  const nav = document.getElementById('nav');
  const music = document.getElementById('bg-music');

  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    music.play().catch(()=>{});
    document.getElementById('music-toggle').classList.add('spin');
    setTimeout(() => {
      envScreen.classList.add('opened');
      nav.classList.add('show');
    }, 750);
  });

  // ---------- Music toggle ----------
  const musicBtn = document.getElementById('music-toggle');
  musicBtn.addEventListener('click', () => {
    if (music.paused) {
      music.play().catch(()=>{});
      musicBtn.classList.add('spin');
    } else {
      music.pause();
      musicBtn.classList.remove('spin');
    }
  });

  // ---------- Countdown ----------
  const weddingDate = new Date('2026-11-01T08:00:00+07:00').getTime();
  function updateCountdown(){
    const now = Date.now();
    const diff = Math.max(0, weddingDate - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent = String(days).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2,'0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // ---------- Gallery: swipeable carousel ----------
  const galleryTrack = document.getElementById('gallery-track');
  if (galleryTrack) {
    const galleryItems = galleryTrack.querySelectorAll('.gal-item');
    const galleryCounter = document.getElementById('gallery-counter');
    const total = galleryItems.length;

    function updateActiveSlide(){
      const trackRect = galleryTrack.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      galleryItems.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const dist = Math.abs(itemCenter - center);
        if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      });
      galleryItems.forEach((item, i) => item.classList.toggle('active', i === closestIndex));
      if (galleryCounter) galleryCounter.textContent = `${closestIndex + 1} / ${total}`;
    }

    function slideStep(){
      const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
      const w = galleryItems[0].getBoundingClientRect().width;
      return w + gap;
    }

    let scrollDebounce;
    galleryTrack.addEventListener('scroll', () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(updateActiveSlide, 60);
    });

    document.getElementById('gallery-prev').addEventListener('click', () => {
      galleryTrack.scrollBy({ left: -slideStep(), behavior: 'smooth' });
    });
    document.getElementById('gallery-next').addEventListener('click', () => {
      galleryTrack.scrollBy({ left: slideStep(), behavior: 'smooth' });
    });

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });

    // Mouse drag-to-scroll for desktop (touch swipe works natively on mobile)
    let isDragging = false, dragStartX = 0, dragScrollLeft = 0;
    galleryTrack.addEventListener('pointerdown', e => {
      isDragging = true;
      galleryTrack.classList.add('dragging');
      dragStartX = e.pageX;
      dragScrollLeft = galleryTrack.scrollLeft;
      galleryTrack.setPointerCapture(e.pointerId);
    });
    galleryTrack.addEventListener('pointermove', e => {
      if (!isDragging) return;
      galleryTrack.scrollLeft = dragScrollLeft - (e.pageX - dragStartX);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
      galleryTrack.addEventListener(evt, () => {
        isDragging = false;
        galleryTrack.classList.remove('dragging');
      });
    });

    window.addEventListener('load', updateActiveSlide);
    setTimeout(updateActiveSlide, 300);
  }

  // ---------- Gift boxes: tap to open and reveal QR code ----------
  document.querySelectorAll('.gift-box-wrap').forEach(box => {
    box.addEventListener('click', () => {
      box.classList.toggle('opened');
      const hint = box.nextElementSibling;
      if (hint && hint.classList.contains('gift-hint')) {
        hint.textContent = box.classList.contains('opened')
          ? 'Chạm để đóng hộp quà'
          : 'Chạm để mở hộp quà';
      }
    });
  });

  // ---------- RSVP form ----------
  document.getElementById('rsvp-form').addEventListener('submit', function(e){
    e.preventDefault();
    // TODO: thay bằng gọi API / Google Form / email thật của bạn
    this.style.display = 'none';
    document.getElementById('rsvp-msg').style.display = 'block';
  });