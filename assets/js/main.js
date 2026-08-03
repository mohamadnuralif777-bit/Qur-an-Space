(function () {
  const materiList = document.getElementById('materi-list');
  const kategoriNav = document.getElementById('kategori-nav');
  const yearEl = document.getElementById('year');
  const totalMateriEl = document.getElementById('total-materi');
  const totalDitampilkanEl = document.getElementById('total-ditampilkan');
  const searchInputEl = document.getElementById('search-materi');
  const filterKategoriEl = document.getElementById('filter-kategori');
  const defaultKategoriOrder = ["Al-Qur'an", 'Hadits', 'Fiqih', 'Aqidah', 'Sirah Nabawi', 'Akhlak', 'Lainnya'];
  let allItems = [];
  let availableKategori = [];

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

  const getKategoriOrder = (grouped) => {
    const customKategori = Object.keys(grouped).filter((name) => !defaultKategoriOrder.includes(name));
    return [
      ...defaultKategoriOrder.filter((name) => grouped[name]),
      ...customKategori.sort((a, b) => a.localeCompare(b, 'id'))
    ];
  };

  const setCounters = (ditampilkan, total) => {
    if (totalMateriEl) totalMateriEl.textContent = String(total);
    if (totalDitampilkanEl) totalDitampilkanEl.textContent = String(ditampilkan);
  };

  const renderError = (message, isHtml = false) => {
    materiList.innerHTML = isHtml ? `<p class="hint">${message}</p>` : `<p class="hint">${escapeHtml(message)}</p>`;
    kategoriNav.innerHTML = '<p class="hint">Kategori belum tersedia.</p>';
    setCounters(0, 0);
  };

  const buildFilterKategori = (kategoriNames) => {
    if (!filterKategoriEl) return;
    const currentValue = filterKategoriEl.value;
    const options = ['<option value="">Semua Kategori</option>']
      .concat(
        kategoriNames.map((kategori) => `<option value="${escapeHtml(kategori)}">${escapeHtml(kategori)}</option>`)
      )
      .join('');
    filterKategoriEl.innerHTML = options;
    if (kategoriNames.includes(currentValue)) {
      filterKategoriEl.value = currentValue;
    }
  };

  const renderGroupedList = (items) => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.kategori]) acc[item.kategori] = [];
      acc[item.kategori].push(item);
      return acc;
    }, {});

    const kategoriNames = getKategoriOrder(grouped);

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

  const applyFilters = () => {
    if (allItems.length === 0) {
      setCounters(0, 0);
      return;
    }

    const keyword = String(searchInputEl?.value || '').trim().toLowerCase();
    const selectedKategori = String(filterKategoriEl?.value || '').trim();
    const filteredItems = allItems.filter((item) => {
      const matchKategori = selectedKategori ? item.kategori === selectedKategori : true;
      const sourceText = `${item.judul} ${item.kategori} ${item.deskripsi}`.toLowerCase();
      const matchKeyword = keyword ? sourceText.includes(keyword) : true;
      return matchKategori && matchKeyword;
    });

    setCounters(filteredItems.length, allItems.length);
    if (filteredItems.length === 0) {
      materiList.innerHTML = '<p class="hint">Tidak ada materi yang cocok dengan pencarian/filter saat ini.</p>';
      kategoriNav.innerHTML = '<p class="hint">Tidak ada kategori yang cocok dengan filter.</p>';
      return;
    }

    renderGroupedList(filteredItems);
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

    allItems = normalizedItems;
    const groupedAll = normalizedItems.reduce((acc, item) => {
      if (!acc[item.kategori]) acc[item.kategori] = [];
      acc[item.kategori].push(item);
      return acc;
    }, {});
    availableKategori = getKategoriOrder(groupedAll);
    buildFilterKategori(availableKategori);
    applyFilters();
  };

  if (searchInputEl) {
    searchInputEl.addEventListener('input', applyFilters);
  }
  if (filterKategoriEl) {
    filterKategoriEl.addEventListener('change', applyFilters);
  }

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
