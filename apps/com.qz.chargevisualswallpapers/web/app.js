(() => {
  const all = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Hiện từng phần khi vào khung nhìn; mỗi section đếm thứ tự riêng để so le 80ms.
  // Shutter: clip-path làm IntersectionObserver thấy diện tích 0, nên mở ngay khi trang dựng xong (luôn nằm ở màn đầu).
  const shutter = document.querySelector('.shutter');
  if (shutter) requestAnimationFrame(() => requestAnimationFrame(() => shutter.classList.add('is-in')));
  const reveals = all('[data-reveal]:not(.shutter)');
  for (const section of all('main > section')) all('[data-reveal]', section).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 6)));
  const show = (el) => el.classList.add('is-in');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
    addEventListener('load', () => setTimeout(() => reveals.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) show(el);
    }), 2500));
  } else reveals.forEach(show);

  // Đồng hồ và ngày theo giờ máy người xem.
  const pad = (n) => String(n).padStart(2, '0');
  const dateFmt = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  const tick = () => {
    const now = new Date();
    const hh = pad(now.getHours()), mm = pad(now.getMinutes());
    all('[data-clock]').forEach((el) => { el.textContent = `${hh}:${mm}`; });
    all('[data-clock-stack]').forEach((el) => { el.innerHTML = `${hh}<br>${mm}`; });
    const d = dateFmt.format(now);
    all('[data-date]').forEach((el) => { el.textContent = d.charAt(0).toUpperCase() + d.slice(1); });
  };
  tick();
  setInterval(tick, 15000);

  // Mức pin thật nếu trình duyệt cho đọc (Chrome Android); không có thì giữ số mẫu.
  if (navigator.getBattery) navigator.getBattery().then((b) => {
    const paint = () => {
      const level = Math.round(b.level * 100);
      all('[data-level]').forEach((el) => { el.textContent = level; });
      all('[data-fill]').forEach((el) => el.style.setProperty('--level', `${level}%`));
      all('[data-state]').forEach((el) => {
        el.textContent = b.charging ? (level >= 100 ? 'Đã sạc đầy · rút sạc để đóng' : 'Đang sạc · máy của bạn') : 'Chưa cắm sạc · cắm thử xem';
      });
    };
    paint();
    b.addEventListener('levelchange', paint);
    b.addEventListener('chargingchange', paint);
  }).catch(() => {});

  // Thẻ Sẵn sàng ở giữa: bấm Bật là xong bước cuối.
  const live = document.getElementById('ready-live');
  const btn = live && live.querySelector('[data-ready-btn]');
  if (btn) btn.addEventListener('click', () => {
    live.querySelector('[data-ready-kicker]').innerHTML = '<i class="dot"></i>Sẵn sàng · 3/3';
    live.querySelector('[data-ready-kicker]').classList.add('ready__kicker--ok');
    live.querySelector('[data-ready-title]').textContent = 'Xong. Cắm sạc để xem';
    live.querySelector('[data-ready-step]').classList.add('on');
    const st = live.querySelector('[data-ready-st]');
    st.className = 'perm__st ok';
    st.innerHTML = '<svg><use href="#i-check"/></svg>';
    const done = document.createElement('span');
    done.className = 'chip-done';
    done.textContent = 'Đã bật';
    btn.replaceWith(done);
    live.classList.add('ready--ok');
  }, { once: true });

  // Cách dùng: câu gần giữa màn hình quyết định trạng thái sân khấu.
  const stage = document.querySelector('.how__stage');
  const steps = all('.how__step');
  if (stage && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        steps.forEach((s) => s.classList.toggle('is-active', s === e.target));
        stage.dataset.how = e.target.dataset.step;
      }
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => so.observe(s));
  }

  // Công tắc: chuột, Space, Enter (button gốc đã xử lý phím).
  all('.switch').forEach((sw) => sw.addEventListener('click', () => {
    sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
  }));
})();
