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

   // ---------- Lightbox: fullscreen photo viewer ----------
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    let lightboxIndex = 0;

    function renderLightbox(){
      const sourceItem = galleryItems[lightboxIndex];
      const sourceImg = sourceItem.querySelector('img');
      if (sourceImg) {
        const freshImg = document.createElement('img');
        freshImg.src = sourceImg.getAttribute('src');
        freshImg.alt = sourceImg.getAttribute('alt') || '';
        lightboxContent.innerHTML = '';
        lightboxContent.appendChild(freshImg);
      } else {
        lightboxContent.innerHTML = sourceItem.innerHTML;
      }
    }
    function switchLightbox(){
      lightboxContent.style.opacity = '0';
      setTimeout(() => {
        renderLightbox();
        const img = lightboxContent.querySelector('img');
        if (img && !img.complete) {
          img.addEventListener('load', () => { lightboxContent.style.opacity = '1'; }, { once: true });
          img.addEventListener('error', () => { lightboxContent.style.opacity = '1'; }, { once: true });
        } else {
          lightboxContent.style.opacity = '1';
        }
      }, 180);
    }
    function openLightbox(i){
      lightboxIndex = i;
      renderLightbox();
      lightbox.classList.add('show');
    }
    function closeLightbox(){
      lightbox.classList.remove('show');
    }
    function showPrev(){
      lightboxIndex = (lightboxIndex - 1 + total) % total;
      switchLightbox();
    }
    function showNext(){
      lightboxIndex = (lightboxIndex + 1) % total;
      switchLightbox();
    }

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', showPrev);
    document.getElementById('lightbox-next').addEventListener('click', showNext);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (dragMoved) return; // ignore click right after a drag-scroll gesture
        openLightbox(i);
      });
    });

    // Mouse drag-to-scroll for desktop (touch swipe works natively on mobile)
    let isDragging = false, dragStartX = 0, dragScrollLeft = 0, dragMoved = false;
    galleryTrack.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return; // let touch use native swipe/tap, untouched
      isDragging = true;
      dragMoved = false;
      galleryTrack.classList.add('dragging');
      dragStartX = e.pageX;
      dragScrollLeft = galleryTrack.scrollLeft;
      galleryTrack.setPointerCapture(e.pointerId);
    });
    galleryTrack.addEventListener('pointermove', e => {
      if (!isDragging) return;
      if (Math.abs(e.pageX - dragStartX) > 6) dragMoved = true;
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
  
  
  // ---------- Live wishes wall (Firebase) ----------
  // Dán cấu hình Firebase của bạn vào đây (xem hướng dẫn trong HUONG-DAN-LOI-CHUC.md)
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
	apiKey: "AIzaSyB4F2ArqGvXkbZes2ByNi-Cm8rxlPurfsw",
	authDomain: "mywedding-83971.firebaseapp.com",
	databaseURL: "https://mywedding-83971-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "mywedding-83971",
	storageBucket: "mywedding-83971.firebasestorage.app",
	messagingSenderId: "438823250851",
	appId: "1:438823250851:web:b9215085ec1fbaea570816",
	measurementId: "G-67J5YG0B3V"
  };

  let wishesRef = null;
  let wishesList = [];
  let wishIndex = 0;
  let wishAutoTimer = null;

  const wishesListEl = document.getElementById('wishes-list');
  const wishesPrevBtn = document.getElementById('wishes-prev');
  const wishesNextBtn = document.getElementById('wishes-next');
  const wishesCounterEl = document.getElementById('wishes-counter');

  function renderWish(){
    if (!wishesList.length) {
      wishesListEl.innerHTML = '<p class="wishes-empty">Chưa có lời chúc nào — hãy là người đầu tiên!</p>';
      wishesPrevBtn.style.display = 'none';
      wishesNextBtn.style.display = 'none';
      wishesCounterEl.textContent = '';
      return;
    }
    const w = wishesList[wishIndex];
    const name = w.name || 'Ẩn danh';
    const initial = name.trim().charAt(0).toUpperCase();
    wishesListEl.innerHTML = `
      <div class="wish-card">
        <div class="wish-avatar">${escapeHtml(initial)}</div>
        <div class="wish-body">
          <div class="wish-name">${escapeHtml(name)}</div>
          <div class="wish-attend">${escapeHtml(w.attend || '')}</div>
          ${w.note ? `<div class="wish-note">${escapeHtml(w.note)}</div>` : ''}
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      const card = wishesListEl.querySelector('.wish-card');
      if (card) card.classList.add('show');
    });
    const showNav = wishesList.length > 1;
    wishesPrevBtn.style.display = showNav ? 'flex' : 'none';
    wishesNextBtn.style.display = showNav ? 'flex' : 'none';
    wishesCounterEl.textContent = `${wishIndex + 1} / ${wishesList.length}`;
  }

  function goToWish(i){
    if (!wishesList.length) return;
    wishIndex = (i + wishesList.length) % wishesList.length;
    renderWish();
  }

  function restartAutoRotate(){
    clearInterval(wishAutoTimer);
    if (wishesList.length > 1) {
      wishAutoTimer = setInterval(() => goToWish(wishIndex + 1), 5000);
    }
  }

  wishesPrevBtn.addEventListener('click', () => { goToWish(wishIndex - 1); restartAutoRotate(); });
  wishesNextBtn.addEventListener('click', () => { goToWish(wishIndex + 1); restartAutoRotate(); });

  if (window.firebase && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    wishesRef = firebase.database().ref('wishes');

    wishesRef.orderByChild('time').on('value', snapshot => {
      const data = snapshot.val();
      wishesList = data ? Object.values(data).sort((a, b) => (b.time || 0) - (a.time || 0)) : [];
      wishIndex = 0;
      renderWish();
      restartAutoRotate();
    });
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- RSVP form ----------
  const rsvpForm = document.getElementById('rsvp-form');
  rsvpForm.addEventListener('submit', function(e){
    e.preventDefault();
    const errorEl = document.getElementById('rsvp-error');
    errorEl.style.display = 'none';

    const wishData = {
      name: document.getElementById('rsvp-name').value,
      attend: document.getElementById('rsvp-attend').value,
      guests: document.getElementById('rsvp-guests').value,
      note: document.getElementById('rsvp-note').value,
      time: Date.now()
    };

    function showSuccess(){
      rsvpForm.style.display = 'none';
      document.getElementById('rsvp-msg').style.display = 'block';
    }

    // Gửi email thông báo qua Formspree — chỉ là kênh phụ để bạn nhận email,
    // lỗi ở đây (ví dụ chưa dán link Formspree thật) sẽ KHÔNG báo cho khách,
    // vì lời chúc vẫn được lưu và hiển thị lên web bình thường.
    fetch(rsvpForm.action, {
      method: 'POST',
      body: new FormData(rsvpForm),
      headers: { 'Accept': 'application/json' }
    }).catch(() => {});

    if (wishesRef) {
      // Có Firebase: đây là kênh chính quyết định thành công/thất bại
      wishesRef.push(wishData)
        .then(showSuccess)
        .catch(() => { errorEl.style.display = 'block'; });
    } else {
      // Chưa cấu hình Firebase: vẫn báo thành công để không chặn khách
      showSuccess();
    }
  });