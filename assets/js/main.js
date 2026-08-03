(function () {
  const materiList = document.getElementById('materi-list');
  const kategoriNav = document.getElementById('kategori-nav');
  const yearEl = document.getElementById('year');

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

  const renderError = (message) => {
    materiList.innerHTML = `<p class="hint">${message}</p>`;
    kategoriNav.innerHTML = '<p class="hint">Kategori belum tersedia.</p>';
  };

  const renderMateri = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      renderError('Belum ada materi di manifest. Tambahkan entri baru pada file manifest.');
      return;
    }

    const grouped = items.reduce((acc, item) => {
      const kategori = item.kategori || 'Lainnya';
      if (!acc[kategori]) acc[kategori] = [];
      acc[kategori].push(item);
      return acc;
    }, {});

    const kategoriNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'id'));

    kategoriNav.innerHTML = kategoriNames
      .map((kategori) => {
        const slug = createSlug(kategori) || 'kategori';
        return `<a class="kategori-link" href="#kategori-${slug}">${kategori}</a>`;
      })
      .join('');

    materiList.innerHTML = kategoriNames
      .map((kategori) => {
        const slug = createSlug(kategori) || 'kategori';
        const entries = grouped[kategori]
          .map((item) => {
            const judul = item.judul || 'Tanpa Judul';
            const path = item.path || '#';
            const deskripsi = item.deskripsi ? `<p>${item.deskripsi}</p>` : '';
            return `<li class="item"><a href="${path}">${judul}</a>${deskripsi}</li>`;
          })
          .join('');

        return `
          <article class="kategori-group" id="kategori-${slug}">
            <h3>${kategori}</h3>
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
      renderError('Gagal memuat manifest. Periksa file materi/manifest.json.');
    });
})();
