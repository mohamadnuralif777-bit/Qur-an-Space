(function () {
  const materiList = document.getElementById('materi-list');
  const kategoriNav = document.getElementById('kategori-nav');
  const yearEl = document.getElementById('year');
  const totalMateriEl = document.getElementById('total-materi');
  const defaultKategoriOrder = ["Al-Qur'an", 'Hadits', 'Fiqih', 'Aqidah', 'Sirah Nabawi', 'Akhlak', 'Lainnya'];

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const createSlug = (text) =>
    String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const escapeHtml = (text) =>
    String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const isValidPath = (path) => {
    if (typeof path !== 'string') return false;
    const value = path.trim();
    if (!value || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) {
      return false;
    }
    return value.endsWith('.html');
  };

  const renderError = (message, isHtml = false) => {
    materiList.innerHTML = isHtml ? `<p class="hint">${message}</p>` : `<p class="hint">${escapeHtml(message)}</p>`;
    kategoriNav.innerHTML = '<p class="hint">Kategori belum tersedia.</p>';
    if (totalMateriEl) totalMateriEl.textContent = '0';
  };

  const renderMateri = (items) => {
    if (!Array.isArray(items)) {
      renderError('Format manifest tidak valid. Pastikan bentuk data adalah array.');
      return;
    }

    const normalizedItems = items
      .filter((item) => item && typeof item === 'object' && isValidPath(item.path))
      .map((item) => ({
        judul: String(item.judul || '').trim() || 'Tanpa Judul',
        kategori: String(item.kategori || 'Lainnya').trim() || 'Lainnya',
        path: String(item.path).trim(),
        deskripsi: item.deskripsi ? String(item.deskripsi).trim() : ''
      }));

    if (normalizedItems.length === 0) {
      renderError('Belum ada materi di manifest. Tambahkan entri baru pada file manifest.');
      return;
    }

    const grouped = normalizedItems.reduce((acc, item) => {
      const kategori = item.kategori || 'Lainnya';
      if (!acc[kategori]) acc[kategori] = [];
      acc[kategori].push(item);
      return acc;
    }, {});

    const customKategori = Object.keys(grouped).filter((name) => !defaultKategoriOrder.includes(name));
    const kategoriNames = [
      ...defaultKategoriOrder.filter((name) => grouped[name]),
      ...customKategori.sort((a, b) => a.localeCompare(b, 'id'))
    ];

    if (totalMateriEl) {
      totalMateriEl.textContent = String(normalizedItems.length);
    }

    kategoriNav.innerHTML = kategoriNames
      .map((kategori) => {
        const slug = createSlug(kategori) || 'kategori';
        return `<a class="kategori-link" href="#kategori-${slug}">${escapeHtml(kategori)}</a>`;
      })
      .join('');

    materiList.innerHTML = kategoriNames
      .map((kategori) => {
        const slug = createSlug(kategori) || 'kategori';
        const entries = grouped[kategori]
          .slice()
          .sort((a, b) => a.judul.localeCompare(b.judul, 'id'))
          .map((item) => {
            const judul = escapeHtml(item.judul || 'Tanpa Judul');
            const path = encodeURI(item.path || '#');
            const deskripsi = item.deskripsi ? `<p>${escapeHtml(item.deskripsi)}</p>` : '';
            return `<li class="item"><a href="${path}">${judul}</a>${deskripsi}</li>`;
          })
          .join('');

        return `
          <article class="kategori-group" id="kategori-${slug}">
            <h3>${escapeHtml(kategori)}</h3>
            <ul class="item-list">${entries}</ul>
          </article>
        `;
      })
      .join('');
  };

  fetch('materi/manifest.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(renderMateri)
    .catch(() => {
      if (window.location.protocol === 'file:') {
        renderError('Gagal memuat manifest saat dibuka langsung dari file lokal. Jalankan server lokal terlebih dahulu, misalnya <code>python -m http.server 8080</code>, lalu buka <code>http://localhost:8080</code>.', true);
        return;
      }
      renderError('Gagal memuat manifest. Periksa file materi/manifest.json.');
    });
})();
