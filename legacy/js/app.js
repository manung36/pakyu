/**
 * PAK Konversi Dosen — Main Application
 * Router, page rendering, event handling
 */

const App = {
  currentPage: 'dashboard',
  state: {},

  /** Initialize the app */
  async init() {
    await DB.openDB();
    App.setupRouter();
    App.setupSidebar();
    App.navigate(window.location.hash.slice(1) || 'dashboard');
  },

  // ======== ROUTER ========
  setupRouter() {
    window.addEventListener('hashchange', () => {
      App.navigate(window.location.hash.slice(1) || 'dashboard');
    });
  },

  navigate(page) {
    App.currentPage = page;
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    // Render page
    App.renderPage(page);
  },

  async renderPage(page) {
    const content = document.getElementById('main-content-area');
    if (!content) return;
    content.classList.add('anim-fade-in');

    switch (page) {
      case 'dashboard': await App.renderDashboard(content); break;
      case 'dosen': await App.renderDosen(content); break;
      case 'import': await App.renderImport(content); break;
      case 'penilaian': await App.renderPenilaian(content); break;
      case 'dokumen': await App.renderDokumen(content); break;
      default: await App.renderDashboard(content); break;
    }

    setTimeout(() => content.classList.remove('anim-fade-in'), 500);
  },

  // ======== SIDEBAR ========
  setupSidebar() {
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
          window.location.hash = page;
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      });
    });
  },

  // ================================================================
  // PAGE: Dashboard
  // ================================================================
  async renderDashboard(container) {
    const totalDosen = await DB.countRecords(DB.STORES.PEGAWAI);
    const totalPenilaian = await DB.countRecords(DB.STORES.PENILAIAN);
    const totalPenetapan = await DB.countRecords(DB.STORES.PENETAPAN);
    const allPegawai = await DB.getAllRecords(DB.STORES.PEGAWAI);

    // Count by jabatan
    const jabatanCount = {};
    allPegawai.forEach(p => {
      jabatanCount[p.jabatan_fungsional] = (jabatanCount[p.jabatan_fungsional] || 0) + 1;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Ringkasan data PAK Konversi Dosen</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-card-blue stagger-1">
          <div class="stat-card-top">
            <span class="stat-card-label">Total Dosen</span>
            <div class="stat-card-icon">👤</div>
          </div>
          <div class="stat-card-value">${totalDosen}</div>
          <div class="stat-card-sub">Data master terdaftar</div>
        </div>

        <div class="stat-card stat-card-gold stagger-2">
          <div class="stat-card-top">
            <span class="stat-card-label">Penilaian AK</span>
            <div class="stat-card-icon">📊</div>
          </div>
          <div class="stat-card-value">${totalPenilaian}</div>
          <div class="stat-card-sub">Rekaman konversi</div>
        </div>

        <div class="stat-card stat-card-green stagger-3">
          <div class="stat-card-top">
            <span class="stat-card-label">Penetapan PAK</span>
            <div class="stat-card-icon">📋</div>
          </div>
          <div class="stat-card-value">${totalPenetapan}</div>
          <div class="stat-card-sub">Dokumen dibuat</div>
        </div>

        <div class="stat-card stat-card-red stagger-4">
          <div class="stat-card-top">
            <span class="stat-card-label">Jabatan</span>
            <div class="stat-card-icon">🎓</div>
          </div>
          <div class="stat-card-value">${Object.keys(jabatanCount).length}</div>
          <div class="stat-card-sub">Kategori jabatan fungsional</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card anim-fade-in-up">
          <div class="card-header">
            <h3 class="card-title">Distribusi Jabatan Fungsional</h3>
          </div>
          <div class="card-body">
            ${totalDosen > 0 ? `
              <div class="distribution-bars">
                ${['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor'].map((jab, i) => {
                  const count = jabatanCount[jab] || 0;
                  const pct = totalDosen > 0 ? (count / totalDosen * 100) : 0;
                  const colors = ['fill-blue', 'fill-gold', 'fill-green', 'fill-red'];
                  return `
                    <div class="dist-item">
                      <div class="dist-label">
                        <span class="dist-label-name">${jab}</span>
                        <span class="dist-label-value">${count} dosen</span>
                      </div>
                      <div class="dist-bar">
                        <div class="dist-bar-fill dist-bar-${colors[i]}" style="width: ${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div class="empty-state" style="padding: var(--space-8) 0;">
                <div class="empty-state-icon">📊</div>
                <p class="text-muted">Belum ada data dosen</p>
              </div>
            `}
          </div>
        </div>

        <div class="card anim-fade-in-up">
          <div class="card-header">
            <h3 class="card-title">Akses Cepat</h3>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="quick-action-btn" onclick="window.location.hash='import'">
                <span class="icon">📥</span>
                Import Excel
              </button>
              <button class="quick-action-btn" onclick="window.location.hash='dosen'">
                <span class="icon">👤</span>
                Data Dosen
              </button>
              <button class="quick-action-btn" onclick="window.location.hash='penilaian'">
                <span class="icon">🧮</span>
                Penilaian AK
              </button>
              <button class="quick-action-btn" onclick="window.location.hash='dokumen'">
                <span class="icon">📄</span>
                Buat Dokumen
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ================================================================
  // PAGE: Data Dosen
  // ================================================================
  async renderDosen(container) {
    const allDosen = await DB.getAllRecords(DB.STORES.PEGAWAI);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Data Dosen</h1>
          <p class="page-subtitle">Pengelolaan data master pegawai dosen</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-add-dosen">➕ Tambah Dosen</button>
        </div>
      </div>

      <div class="card mb-6">
        <div class="d-flex align-center justify-between gap-4 mb-4" style="flex-wrap:wrap">
          <div class="search-bar">
            <span class="search-bar-icon">🔍</span>
            <input type="text" id="search-dosen" placeholder="Cari nama, NIP, atau unit kerja..." />
          </div>
          <div class="d-flex gap-2">
            <select class="form-control" id="filter-jabatan" style="width:auto;min-width:160px">
              <option value="">Semua Jabatan</option>
              <option value="Asisten Ahli">Asisten Ahli</option>
              <option value="Lektor">Lektor</option>
              <option value="Lektor Kepala">Lektor Kepala</option>
              <option value="Profesor">Profesor</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table" id="table-dosen">
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Lengkap</th>
                <th>Jabatan Fungsional</th>
                <th>Pangkat/Gol</th>
                <th>Unit Kerja</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-dosen">
              ${App.renderDosenRows(allDosen)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Tambah/Edit Dosen -->
      <div class="modal-overlay" id="modal-dosen">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-dosen-title">Tambah Dosen</h3>
            <button class="modal-close" id="modal-dosen-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="form-dosen">
              <input type="hidden" id="dosen-id" />
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">NIP <span class="required">*</span></label>
                  <input type="text" class="form-control" id="dosen-nip" maxlength="18" placeholder="18 digit NIP" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                  <input type="text" class="form-control" id="dosen-nama" placeholder="Nama lengkap" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">No. Seri Karpeg</label>
                  <input type="text" class="form-control" id="dosen-karpeg" placeholder="Opsional" />
                </div>
                <div class="form-group">
                  <label class="form-label">Jenis Kelamin <span class="required">*</span></label>
                  <select class="form-control" id="dosen-jk" required>
                    <option value="">-- Pilih --</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Tempat Lahir <span class="required">*</span></label>
                  <input type="text" class="form-control" id="dosen-tempat-lahir" placeholder="Tempat lahir" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Tanggal Lahir <span class="required">*</span></label>
                  <input type="date" class="form-control" id="dosen-tgl-lahir" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Pangkat / Golongan <span class="required">*</span></label>
                  <input type="text" class="form-control" id="dosen-pangkat" placeholder="cth: Penata Muda / III/B" required />
                </div>
                <div class="form-group">
                  <label class="form-label">TMT Pangkat <span class="required">*</span></label>
                  <input type="date" class="form-control" id="dosen-tmt-pangkat" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Jabatan Fungsional <span class="required">*</span></label>
                  <select class="form-control" id="dosen-jabatan" required>
                    <option value="">-- Pilih --</option>
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Profesor">Profesor</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">TMT Jabatan <span class="required">*</span></label>
                  <input type="date" class="form-control" id="dosen-tmt-jabatan" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Unit Kerja <span class="required">*</span></label>
                <input type="text" class="form-control" id="dosen-unit-kerja" placeholder="Fakultas / Program Studi" required />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="btn-cancel-dosen">Batal</button>
            <button class="btn btn-primary" id="btn-save-dosen">💾 Simpan</button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    App.setupDosenEvents();
  },

  renderDosenRows(dosenList) {
    if (dosenList.length === 0) {
      return `<tr><td colspan="7" class="table-empty">
        <div class="table-empty-icon">👤</div>
        <p>Belum ada data dosen. Import melalui Excel atau tambah secara manual.</p>
      </td></tr>`;
    }
    return dosenList.map((d, i) => `
      <tr data-id="${d.id}">
        <td>${i + 1}</td>
        <td style="font-family:monospace;font-size:0.75rem">${Utils.escapeHtml(d.nip)}</td>
        <td><strong>${Utils.escapeHtml(d.nama_lengkap)}</strong></td>
        <td><span class="badge badge-primary">${Utils.escapeHtml(d.jabatan_fungsional)}</span></td>
        <td>${Utils.escapeHtml(d.pangkat_golongan)}</td>
        <td>${Utils.escapeHtml(d.unit_kerja)}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-ghost btn-sm btn-edit-dosen" data-id="${d.id}">✏️</button>
            <button class="btn btn-ghost btn-sm btn-delete-dosen" data-id="${d.id}" data-nama="${Utils.escapeHtml(d.nama_lengkap)}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  setupDosenEvents() {
    const modal = document.getElementById('modal-dosen');
    const openModal = () => modal.classList.add('active');
    const closeModal = () => { modal.classList.remove('active'); document.getElementById('form-dosen').reset(); document.getElementById('dosen-id').value = ''; };

    document.getElementById('btn-add-dosen').addEventListener('click', () => {
      document.getElementById('modal-dosen-title').textContent = 'Tambah Dosen';
      document.getElementById('dosen-id').value = '';
      document.getElementById('form-dosen').reset();
      openModal();
    });

    document.getElementById('modal-dosen-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-dosen').addEventListener('click', closeModal);

    // Save
    document.getElementById('btn-save-dosen').addEventListener('click', async () => {
      const form = document.getElementById('form-dosen');
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const id = document.getElementById('dosen-id').value;
      const data = {
        nip: document.getElementById('dosen-nip').value.trim(),
        nama_lengkap: document.getElementById('dosen-nama').value.trim(),
        no_karpeg: document.getElementById('dosen-karpeg').value.trim(),
        jenis_kelamin: document.getElementById('dosen-jk').value,
        tempat_lahir: document.getElementById('dosen-tempat-lahir').value.trim(),
        tanggal_lahir: document.getElementById('dosen-tgl-lahir').value,
        pangkat_golongan: document.getElementById('dosen-pangkat').value.trim(),
        tmt_pangkat: document.getElementById('dosen-tmt-pangkat').value,
        jabatan_fungsional: document.getElementById('dosen-jabatan').value,
        tmt_jabatan: document.getElementById('dosen-tmt-jabatan').value,
        unit_kerja: document.getElementById('dosen-unit-kerja').value.trim(),
      };

      // Validate NIP
      const nipResult = Utils.validateNIP(data.nip);
      if (!nipResult.valid) { Utils.showToast(nipResult.message, 'error'); return; }

      try {
        if (id) {
          data.id = parseInt(id);
          await DB.updateRecord(DB.STORES.PEGAWAI, data);
          Utils.showToast('Data dosen berhasil diperbarui', 'success');
        } else {
          await DB.addRecord(DB.STORES.PEGAWAI, data);
          Utils.showToast('Dosen berhasil ditambahkan', 'success');
        }
        closeModal();
        App.renderDosen(document.getElementById('main-content-area'));
      } catch (err) {
        Utils.showToast('Kesalahan: ' + err.message, 'error');
      }
    });

    // Edit & Delete (event delegation)
    document.getElementById('tbody-dosen').addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-edit-dosen');
      const deleteBtn = e.target.closest('.btn-delete-dosen');

      if (editBtn) {
        const id = parseInt(editBtn.dataset.id);
        const dosen = await DB.getRecord(DB.STORES.PEGAWAI, id);
        if (!dosen) return;

        document.getElementById('modal-dosen-title').textContent = 'Edit Dosen';
        document.getElementById('dosen-id').value = dosen.id;
        document.getElementById('dosen-nip').value = dosen.nip;
        document.getElementById('dosen-nama').value = dosen.nama_lengkap;
        document.getElementById('dosen-karpeg').value = dosen.no_karpeg || '';
        document.getElementById('dosen-jk').value = dosen.jenis_kelamin;
        document.getElementById('dosen-tempat-lahir').value = dosen.tempat_lahir;
        document.getElementById('dosen-tgl-lahir').value = dosen.tanggal_lahir;
        document.getElementById('dosen-pangkat').value = dosen.pangkat_golongan;
        document.getElementById('dosen-tmt-pangkat').value = dosen.tmt_pangkat;
        document.getElementById('dosen-jabatan').value = dosen.jabatan_fungsional;
        document.getElementById('dosen-tmt-jabatan').value = dosen.tmt_jabatan;
        document.getElementById('dosen-unit-kerja').value = dosen.unit_kerja;
        openModal();
      }

      if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id);
        const nama = deleteBtn.dataset.nama;
        if (confirm(`Hapus data dosen "${nama}"?`)) {
          try {
            await DB.deleteRecord(DB.STORES.PEGAWAI, id);
            Utils.showToast('Data dosen berhasil dihapus', 'success');
            App.renderDosen(document.getElementById('main-content-area'));
          } catch (err) {
            Utils.showToast('Kesalahan: ' + err.message, 'error');
          }
        }
      }
    });

    // Search & Filter
    const searchInput = document.getElementById('search-dosen');
    const filterJabatan = document.getElementById('filter-jabatan');

    const filterDosen = Utils.debounce(async () => {
      const query = searchInput.value.toLowerCase();
      const jabatan = filterJabatan.value;
      let allDosen = await DB.getAllRecords(DB.STORES.PEGAWAI);

      if (query) {
        allDosen = allDosen.filter(d =>
          d.nama_lengkap.toLowerCase().includes(query) ||
          d.nip.includes(query) ||
          d.unit_kerja.toLowerCase().includes(query)
        );
      }
      if (jabatan) {
        allDosen = allDosen.filter(d => d.jabatan_fungsional === jabatan);
      }

      document.getElementById('tbody-dosen').innerHTML = App.renderDosenRows(allDosen);
    }, 250);

    searchInput.addEventListener('input', filterDosen);
    filterJabatan.addEventListener('change', filterDosen);
  },

  // ================================================================
  // PAGE: Import Excel
  // ================================================================
  async renderImport(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Import Data Excel</h1>
          <p class="page-subtitle">Unggah file .xlsx untuk import data master dosen secara pukal</p>
        </div>
      </div>

      <div class="card mb-6">
        <div class="card-header">
          <h3 class="card-title">📥 Unggah File Excel</h3>
        </div>
        <div class="card-body">
          <div class="upload-area" id="upload-area">
            <div class="upload-area-icon">📄</div>
            <div class="upload-area-title">Seret & Lepas file Excel di sini</div>
            <div class="upload-area-desc">atau klik untuk memilih file (.xlsx, maks 10MB)</div>
            <input type="file" id="file-input" accept=".xlsx,.xls" style="display:none" />
          </div>
          <div id="file-info" class="mt-4 hidden"></div>
        </div>
      </div>

      <div id="import-preview" class="hidden"></div>
      <div id="import-result" class="hidden"></div>
    `;

    App.setupImportEvents();
  },

  setupImportEvents() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) App.processImportFile(file);
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) App.processImportFile(file);
    });
  },

  async processImportFile(file) {
    const fileInfo = document.getElementById('file-info');
    fileInfo.classList.remove('hidden');
    fileInfo.innerHTML = `<div class="d-flex align-center gap-3"><span class="badge badge-info">📄 ${Utils.escapeHtml(file.name)}</span> <span class="text-muted">${(file.size / 1024).toFixed(1)} KB</span></div>`;

    try {
      Utils.showToast('Membaca file Excel...', 'info');

      const rawRows = await ImportModule.parseExcel(file);
      const mappedRows = ImportModule.mapRows(rawRows);
      const { validRows, invalidRows } = ImportModule.validateRows(mappedRows);
      const { newRows, conflictRows } = await ImportModule.checkConflicts(validRows);

      App.state.importData = { newRows, conflictRows, invalidRows };

      App.renderImportPreview(newRows, conflictRows, invalidRows);
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  },

  renderImportPreview(newRows, conflictRows, invalidRows) {
    const previewEl = document.getElementById('import-preview');
    previewEl.classList.remove('hidden');

    const allValid = [...newRows, ...conflictRows.map(c => c.newData)];

    previewEl.innerHTML = `
      <div class="card mb-6">
        <div class="card-header">
          <h3 class="card-title">📋 Pratinjau Data</h3>
          <div class="d-flex gap-2">
            <span class="badge badge-success">✓ ${newRows.length} baru</span>
            ${conflictRows.length > 0 ? `<span class="badge badge-warning">⚠ ${conflictRows.length} konflik NIP</span>` : ''}
            ${invalidRows.length > 0 ? `<span class="badge badge-danger">✕ ${invalidRows.length} tidak valid</span>` : ''}
          </div>
        </div>
        <div class="card-body">
          ${allValid.length > 0 ? `
            <div class="table-container" style="max-height:400px;overflow-y:auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Baris</th>
                    <th>NIP</th>
                    <th>Nama</th>
                    <th>Jabatan</th>
                    <th>Unit Kerja</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${newRows.map(r => `
                    <tr>
                      <td>${r._rowIndex || '-'}</td>
                      <td style="font-family:monospace;font-size:0.75rem">${Utils.escapeHtml(r.nip)}</td>
                      <td>${Utils.escapeHtml(r.nama_lengkap)}</td>
                      <td><span class="badge badge-primary">${Utils.escapeHtml(r.jabatan_fungsional)}</span></td>
                      <td>${Utils.escapeHtml(r.unit_kerja)}</td>
                      <td><span class="badge badge-success">Baru</span></td>
                    </tr>
                  `).join('')}
                  ${conflictRows.map(c => `
                    <tr>
                      <td>${c.newData._rowIndex || '-'}</td>
                      <td style="font-family:monospace;font-size:0.75rem">${Utils.escapeHtml(c.newData.nip)}</td>
                      <td>${Utils.escapeHtml(c.newData.nama_lengkap)}</td>
                      <td><span class="badge badge-primary">${Utils.escapeHtml(c.newData.jabatan_fungsional)}</span></td>
                      <td>${Utils.escapeHtml(c.newData.unit_kerja)}</td>
                      <td><span class="badge badge-warning">Konflik</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p class="text-muted">Tidak ada data valid untuk diimport.</p>'}

          ${invalidRows.length > 0 ? `
            <div class="mt-4">
              <p class="text-danger fw-600 mb-2">⚠ ${invalidRows.length} baris tidak valid:</p>
              <div style="max-height:150px;overflow-y:auto;background:var(--color-bg-glass);padding:var(--space-3);border-radius:var(--radius-md);font-size:var(--font-size-xs)">
                ${invalidRows.map(r => `<div class="mb-2">Baris ${r._rowIndex}: ${r.errors.join(', ')}</div>`).join('')}
              </div>
              <button class="btn btn-ghost btn-sm mt-2" id="btn-download-error-log">📥 Unduh Log Kesalahan</button>
            </div>
          ` : ''}
        </div>

        ${allValid.length > 0 ? `
          <div class="card-footer">
            ${conflictRows.length > 0 ? `
              <div class="d-flex align-center gap-3" style="margin-right:auto">
                <span class="text-muted" style="font-size:var(--font-size-sm)">Konflik NIP:</span>
                <label class="form-check"><input type="radio" name="conflict-action" value="skip" checked /> Abaikan (Skip)</label>
                <label class="form-check"><input type="radio" name="conflict-action" value="update" /> Kemas Kini (Update)</label>
              </div>
            ` : ''}
            <button class="btn btn-ghost" id="btn-cancel-import">Batal</button>
            <button class="btn btn-success" id="btn-execute-import">✓ Import ${newRows.length + conflictRows.length} Data</button>
          </div>
        ` : ''}
      </div>
    `;

    // Events
    const execBtn = document.getElementById('btn-execute-import');
    if (execBtn) {
      execBtn.addEventListener('click', async () => {
        const conflictAction = document.querySelector('input[name="conflict-action"]:checked')?.value || 'skip';
        const { newRows, conflictRows } = App.state.importData;

        execBtn.disabled = true;
        execBtn.textContent = '⏳ Mengimport...';

        try {
          const result = await ImportModule.executeImport(newRows, conflictRows, conflictAction);
          const resultEl = document.getElementById('import-result');
          resultEl.classList.remove('hidden');
          resultEl.innerHTML = `
            <div class="card">
              <div class="card-body text-center" style="padding:var(--space-8)">
                <div style="font-size:3rem;margin-bottom:var(--space-3)">✅</div>
                <h3 style="margin-bottom:var(--space-4)">Import Berhasil!</h3>
                <div class="d-flex justify-between gap-4" style="max-width:400px;margin:0 auto;justify-content:center">
                  <div><span class="badge badge-success">${result.addedCount} ditambahkan</span></div>
                  <div><span class="badge badge-info">${result.updatedCount} diperbarui</span></div>
                  <div><span class="badge badge-warning">${result.skippedCount} diabaikan</span></div>
                </div>
                ${result.errors.length > 0 ? `<p class="text-danger mt-4">${result.errors.length} kesalahan saat import</p>` : ''}
                <button class="btn btn-primary mt-6" onclick="window.location.hash='dosen'">📋 Lihat Data Dosen</button>
              </div>
            </div>
          `;

          document.getElementById('import-preview').classList.add('hidden');
          Utils.showToast(`Import selesai: ${result.addedCount} ditambahkan`, 'success');
        } catch (err) {
          Utils.showToast('Kesalahan import: ' + err.message, 'error');
          execBtn.disabled = false;
          execBtn.textContent = '✓ Import Data';
        }
      });
    }

    const cancelBtn = document.getElementById('btn-cancel-import');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.getElementById('import-preview').classList.add('hidden');
        App.state.importData = null;
      });
    }

    const errorLogBtn = document.getElementById('btn-download-error-log');
    if (errorLogBtn) {
      errorLogBtn.addEventListener('click', () => {
        ImportModule.generateErrorLog(App.state.importData.invalidRows);
      });
    }
  },

  // ================================================================
  // PAGE: Penilaian AK
  // ================================================================
  async renderPenilaian(container) {
    const allDosen = await DB.getAllRecords(DB.STORES.PEGAWAI);
    const allPenilaian = await DB.getAllRecords(DB.STORES.PENILAIAN);

    const dosenOptions = allDosen.map(d => `<option value="${d.id}">${Utils.escapeHtml(d.nama_lengkap)} (${d.nip})</option>`).join('');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Penilaian Angka Kredit</h1>
          <p class="page-subtitle">Perhitungan konversi predikat kinerja ke angka kredit</p>
        </div>
        <button class="btn btn-primary" id="btn-add-penilaian">➕ Tambah Penilaian</button>
      </div>

      <!-- Quick Calculator -->
      <div class="card mb-6">
        <div class="card-header">
          <h3 class="card-title">🧮 Kalkulator Cepat</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Jabatan Fungsional</label>
              <select class="form-control" id="calc-jabatan">
                <option value="Asisten Ahli">Asisten Ahli (12.5)</option>
                <option value="Lektor">Lektor (25.0)</option>
                <option value="Lektor Kepala">Lektor Kepala (25.0)</option>
                <option value="Profesor">Profesor (50.0)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Predikat Kinerja</label>
              <select class="form-control" id="calc-predikat">
                <option value="Sangat Baik">Sangat Baik (150%)</option>
                <option value="Baik" selected>Baik (100%)</option>
                <option value="Cukup">Cukup (75%)</option>
                <option value="Kurang">Kurang (50%)</option>
                <option value="Sangat Kurang">Sangat Kurang (25%)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Jumlah Bulan</label>
              <input type="number" class="form-control" id="calc-bulan" value="12" min="1" max="12" />
            </div>
          </div>
          <div class="d-flex align-center gap-4 mt-2">
            <button class="btn btn-gold" id="btn-calc">🧮 Hitung</button>
            <div id="calc-result" style="font-size:var(--font-size-lg)"></div>
          </div>
        </div>
      </div>

      <!-- Existing Penilaian Records -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📊 Rekaman Penilaian Konversi</h3>
          <span class="badge badge-info">${allPenilaian.length} rekaman</span>
        </div>
        <div class="card-body">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Dosen</th>
                  <th>Tahun</th>
                  <th>Periode</th>
                  <th>Predikat</th>
                  <th>AK Didapat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="tbody-penilaian">
                ${await App.renderPenilaianRows(allPenilaian, allDosen)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Tambah Penilaian -->
      <div class="modal-overlay" id="modal-penilaian">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-penilaian-title">Tambah Penilaian Konversi</h3>
            <button class="modal-close" id="modal-penilaian-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="form-penilaian">
              <input type="hidden" id="penilaian-id" />
              <div class="form-group">
                <label class="form-label">Dosen <span class="required">*</span></label>
                <select class="form-control" id="penilaian-pegawai" required>
                  <option value="">-- Pilih Dosen --</option>
                  ${dosenOptions}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Tahun <span class="required">*</span></label>
                  <input type="number" class="form-control" id="penilaian-tahun" placeholder="2024" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Periode Bulan</label>
                  <input type="text" class="form-control" id="penilaian-periode" placeholder="cth: JUNI - DESEMBER" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Jumlah Bulan <span class="required">*</span></label>
                  <input type="number" class="form-control" id="penilaian-bulan" value="12" min="1" max="12" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Predikat Kinerja <span class="required">*</span></label>
                  <select class="form-control" id="penilaian-predikat" required>
                    <option value="">-- Pilih --</option>
                    <option value="Sangat Baik">Sangat Baik (150%)</option>
                    <option value="Baik">Baik (100%)</option>
                    <option value="Cukup">Cukup (75%)</option>
                    <option value="Kurang">Kurang (50%)</option>
                    <option value="Sangat Kurang">Sangat Kurang (25%)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Angka Kredit (auto)</label>
                <input type="text" class="form-control" id="penilaian-ak" readonly style="font-weight:700;font-size:var(--font-size-lg)" />
                <span class="form-hint">Dikira secara otomatis berdasarkan jabatan, predikat & tempoh</span>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="btn-cancel-penilaian">Batal</button>
            <button class="btn btn-primary" id="btn-save-penilaian">💾 Simpan</button>
          </div>
        </div>
      </div>
    `;

    App.setupPenilaianEvents(allDosen);
  },

  async renderPenilaianRows(penilaianList, dosenList) {
    if (penilaianList.length === 0) {
      return `<tr><td colspan="7" class="table-empty">
        <div class="table-empty-icon">📊</div>
        <p>Belum ada rekaman penilaian.</p>
      </td></tr>`;
    }

    const dosenMap = {};
    dosenList.forEach(d => { dosenMap[d.id] = d; });

    return penilaianList.map((p, i) => {
      const dosen = dosenMap[p.pegawai_id];
      return `
        <tr data-id="${p.id}">
          <td>${i + 1}</td>
          <td>${dosen ? Utils.escapeHtml(dosen.nama_lengkap) : '<em class="text-muted">-</em>'}</td>
          <td>${p.tahun || '-'}</td>
          <td>${Utils.escapeHtml(p.periode_bulan || `${p.jumlah_bulan} Bulan`)}</td>
          <td><span class="badge ${p.predikat === 'Sangat Baik' ? 'badge-gold' : p.predikat === 'Baik' ? 'badge-success' : p.predikat === 'Cukup' ? 'badge-info' : 'badge-danger'}">${Utils.escapeHtml(p.predikat)}</span></td>
          <td><strong>${Utils.formatDisplay(p.angka_kredit_didapat)}</strong></td>
          <td>
            <button class="btn btn-ghost btn-sm btn-delete-penilaian" data-id="${p.id}">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  setupPenilaianEvents(dosenList) {
    const dosenMap = {};
    dosenList.forEach(d => { dosenMap[d.id] = d; });

    // Quick calculator
    const calcBtn = document.getElementById('btn-calc');
    calcBtn.addEventListener('click', () => {
      const jabatan = document.getElementById('calc-jabatan').value;
      const predikat = document.getElementById('calc-predikat').value;
      const bulan = parseInt(document.getElementById('calc-bulan').value) || 12;
      const ak = Calculator.hitungAK(jabatan, predikat, bulan);
      document.getElementById('calc-result').innerHTML = `
        <span class="text-gold fw-800">AK = ${Utils.formatAK(ak)}</span>
      `;
    });

    // Modal
    const modal = document.getElementById('modal-penilaian');
    const openModal = () => modal.classList.add('active');
    const closeModal = () => { modal.classList.remove('active'); document.getElementById('form-penilaian').reset(); document.getElementById('penilaian-id').value = ''; };

    document.getElementById('btn-add-penilaian').addEventListener('click', () => {
      document.getElementById('penilaian-id').value = '';
      document.getElementById('form-penilaian').reset();
      document.getElementById('penilaian-bulan').value = '12';
      openModal();
    });

    document.getElementById('modal-penilaian-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-penilaian').addEventListener('click', closeModal);

    // Auto-calculate AK when inputs change
    const autoCalc = () => {
      const pegawaiId = parseInt(document.getElementById('penilaian-pegawai').value);
      const predikat = document.getElementById('penilaian-predikat').value;
      const bulan = parseInt(document.getElementById('penilaian-bulan').value) || 12;
      const dosen = dosenMap[pegawaiId];

      if (dosen && predikat) {
        const ak = Calculator.hitungAK(dosen.jabatan_fungsional, predikat, bulan);
        document.getElementById('penilaian-ak').value = Utils.formatAK(ak);
      }
    };

    document.getElementById('penilaian-pegawai').addEventListener('change', autoCalc);
    document.getElementById('penilaian-predikat').addEventListener('change', autoCalc);
    document.getElementById('penilaian-bulan').addEventListener('input', autoCalc);

    // Save
    document.getElementById('btn-save-penilaian').addEventListener('click', async () => {
      const form = document.getElementById('form-penilaian');
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const pegawaiId = parseInt(document.getElementById('penilaian-pegawai').value);
      const dosen = dosenMap[pegawaiId];
      if (!dosen) { Utils.showToast('Silakan pilih dosen', 'error'); return; }

      const predikat = document.getElementById('penilaian-predikat').value;
      const bulan = parseInt(document.getElementById('penilaian-bulan').value) || 12;
      const ak = Calculator.hitungAK(dosen.jabatan_fungsional, predikat, bulan);

      const data = {
        pegawai_id: pegawaiId,
        tahun: parseInt(document.getElementById('penilaian-tahun').value),
        periode_bulan: document.getElementById('penilaian-periode').value.trim(),
        jumlah_bulan: bulan,
        predikat,
        persentase: Calculator.getPersentaseDisplay(predikat),
        koefisien: Calculator.getKoefisien(dosen.jabatan_fungsional),
        angka_kredit_didapat: ak,
      };

      const id = document.getElementById('penilaian-id').value;
      try {
        if (id) {
          data.id = parseInt(id);
          await DB.updateRecord(DB.STORES.PENILAIAN, data);
          Utils.showToast('Penilaian diperbarui', 'success');
        } else {
          await DB.addRecord(DB.STORES.PENILAIAN, data);
          Utils.showToast('Penilaian berhasil disimpan', 'success');
        }
        closeModal();
        App.renderPenilaian(document.getElementById('main-content-area'));
      } catch (err) {
        Utils.showToast('Kesalahan: ' + err.message, 'error');
      }
    });

    // Delete
    document.getElementById('tbody-penilaian').addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.btn-delete-penilaian');
      if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id);
        if (confirm('Hapus rekaman penilaian ini?')) {
          await DB.deleteRecord(DB.STORES.PENILAIAN, id);
          Utils.showToast('Rekaman dihapus', 'success');
          App.renderPenilaian(document.getElementById('main-content-area'));
        }
      }
    });
  },

  // ================================================================
  // PAGE: Pembuatan Dokumen
  // ================================================================
  async renderDokumen(container) {
    const allDosen = await DB.getAllRecords(DB.STORES.PEGAWAI);
    const dosenOptions = allDosen.map(d => `<option value="${d.id}">${Utils.escapeHtml(d.nama_lengkap)} (${d.nip})</option>`).join('');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Pembuatan Dokumen PAK</h1>
          <p class="page-subtitle">Buat 3 jenis dokumen rasmi PAK Konversi</p>
        </div>
      </div>

      <div class="tabs" id="doc-tabs">
        <div class="tab-item active" data-tab="doc1">📄 Dok. 1 — Konversi</div>
        <div class="tab-item" data-tab="doc2">📄 Dok. 2 — Akumulasi</div>
        <div class="tab-item" data-tab="doc3">📄 Dok. 3 — Penetapan</div>
      </div>

      <!-- Tab: Dokumen 1 -->
      <div class="tab-content" id="tab-doc1">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Konversi Predikat Kinerja ke Angka Kredit</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Dosen <span class="required">*</span></label>
                <select class="form-control" id="doc1-pegawai">
                  <option value="">-- Pilih Dosen --</option>
                  ${dosenOptions}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Penilaian <span class="required">*</span></label>
                <select class="form-control" id="doc1-penilaian">
                  <option value="">-- Pilih dosen terlebih dahulu --</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nomor Surat SK</label>
                <input type="text" class="form-control" id="doc1-nomor-surat" placeholder="< AGAR DIISI PT >" />
              </div>
              <div class="form-group">
                <label class="form-label">Periode Penilaian (Teks)</label>
                <input type="text" class="form-control" id="doc1-periode-text" placeholder="Juni 2023 s.d Desember 2023" />
              </div>
            </div>
            <fieldset class="mt-4" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4)">
              <legend style="padding:0 var(--space-2);font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-muted)">Data Pejabat Penilai</legend>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Pejabat</label>
                  <input type="text" class="form-control" id="doc1-pejabat-nama" placeholder="Nama pejabat penilai" />
                </div>
                <div class="form-group">
                  <label class="form-label">NIP Pejabat</label>
                  <input type="text" class="form-control" id="doc1-pejabat-nip" placeholder="NIP pejabat" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Jabatan Pejabat</label>
                  <input type="text" class="form-control" id="doc1-pejabat-jabatan" placeholder="Jabatan / unit kerja" />
                </div>
                <div class="form-group">
                  <label class="form-label">Kota & Tanggal</label>
                  <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="doc1-kota" placeholder="Kota" style="flex:1" />
                    <input type="date" class="form-control" id="doc1-tanggal" style="flex:1" />
                  </div>
                </div>
              </div>
            </fieldset>

          </div>
          <div class="card-footer">
            <button class="btn btn-primary" id="btn-generate-doc1">📄 Buat Dokumen 1</button>
          </div>
        </div>
      </div>

      <!-- Tab: Dokumen 2 -->
      <div class="tab-content hidden" id="tab-doc2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Akumulasi Angka Kredit Jabatan Fungsional</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Dosen <span class="required">*</span></label>
                <select class="form-control" id="doc2-pegawai">
                  <option value="">-- Pilih Dosen --</option>
                  ${dosenOptions}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">AK Integrasi</label>
                <input type="number" class="form-control" id="doc2-ak-integrasi" value="0" step="0.0000000001" />
              </div>
            </div>
            <fieldset class="mt-4" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4)">
              <legend style="padding:0 var(--space-2);font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-muted)">Data Pejabat Penilai</legend>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Pejabat</label>
                  <input type="text" class="form-control" id="doc2-pejabat-nama" />
                </div>
                <div class="form-group">
                  <label class="form-label">NIP Pejabat</label>
                  <input type="text" class="form-control" id="doc2-pejabat-nip" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Jabatan Pejabat</label>
                  <input type="text" class="form-control" id="doc2-pejabat-jabatan" />
                </div>
                <div class="form-group">
                  <label class="form-label">Kota & Tanggal</label>
                  <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="doc2-kota" placeholder="Kota" style="flex:1" />
                    <input type="date" class="form-control" id="doc2-tanggal" style="flex:1" />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" id="btn-generate-doc2">📄 Buat Dokumen 2</button>
          </div>
        </div>
      </div>

      <!-- Tab: Dokumen 3 -->
      <div class="tab-content hidden" id="tab-doc3">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Penetapan Angka Kredit (PAK Final)</h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Dosen <span class="required">*</span></label>
                <select class="form-control" id="doc3-pegawai">
                  <option value="">-- Pilih Dosen --</option>
                  ${dosenOptions}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nomor Surat SK PAK</label>
                <input type="text" class="form-control" id="doc3-nomor-surat" placeholder="Nomor SK" />
              </div>
            </div>

            <fieldset class="mt-4" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4)">
              <legend style="padding:0 var(--space-2);font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-muted)">AK Lama (Sebelumnya)</legend>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">AK Dasar Lama</label>
                  <input type="number" class="form-control" id="doc3-ak-dasar-lama" value="0" step="0.0000000001" />
                </div>
                <div class="form-group">
                  <label class="form-label">AK Integrasi Lama</label>
                  <input type="number" class="form-control" id="doc3-ak-integrasi-lama" value="0" step="0.0000000001" />
                </div>
                <div class="form-group">
                  <label class="form-label">AK Penyesuaian Lama</label>
                  <input type="number" class="form-control" id="doc3-ak-penyesuaian-lama" value="0" step="0.0000000001" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">AK Konversi Lama</label>
                  <input type="number" class="form-control" id="doc3-ak-konversi-lama" value="0" step="0.0000000001" />
                </div>
                <div class="form-group">
                  <label class="form-label">AK Pendidikan Lama</label>
                  <input type="number" class="form-control" id="doc3-ak-pendidikan-lama" value="0" step="0.0000000001" />
                </div>
              </div>
            </fieldset>

            <fieldset class="mt-4" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4)">
              <legend style="padding:0 var(--space-2);font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-muted)">AK Baru</legend>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">AK Dasar Baru</label>
                  <input type="number" class="form-control" id="doc3-ak-dasar" value="0" step="0.0000000001" />
                </div>
                <div class="form-group">
                  <label class="form-label">AK Integrasi Baru</label>
                  <input type="number" class="form-control" id="doc3-ak-integrasi" value="0" step="0.0000000001" />
                </div>
                <div class="form-group">
                  <label class="form-label">AK Penyesuaian Baru</label>
                  <input type="number" class="form-control" id="doc3-ak-penyesuaian" value="0" step="0.0000000001" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">AK Pendidikan Baru</label>
                  <input type="number" class="form-control" id="doc3-ak-pendidikan" value="0" step="0.0000000001" />
                </div>
              </div>
              <p class="form-hint">AK Konversi Baru akan dikira otomatis daripada rekaman penilaian dosen.</p>
            </fieldset>

            <fieldset class="mt-4" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4)">
              <legend style="padding:0 var(--space-2);font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-muted)">Syarat Minimal</legend>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">AK Minimal Syarat Pangkat</label>
                  <input type="number" class="form-control" id="doc3-ak-min-pangkat" value="0" step="0.0000000001" />
                </div>
                <div class="form-group">
                  <label class="form-label">AK Minimal Syarat Jenjang Jabatan</label>
                  <input type="number" class="form-control" id="doc3-ak-min-jabatan" value="0" step="0.0000000001" />
                </div>
              </div>
            </fieldset>

            <fieldset class="mt-4" style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4)">
              <legend style="padding:0 var(--space-2);font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-muted)">Data Pejabat Penilai</legend>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Pejabat</label>
                  <input type="text" class="form-control" id="doc3-pejabat-nama" />
                </div>
                <div class="form-group">
                  <label class="form-label">NIP Pejabat</label>
                  <input type="text" class="form-control" id="doc3-pejabat-nip" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Jabatan Pejabat</label>
                  <input type="text" class="form-control" id="doc3-pejabat-jabatan" />
                </div>
                <div class="form-group">
                  <label class="form-label">Kota & Tanggal</label>
                  <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="doc3-kota" placeholder="Kota" style="flex:1" />
                    <input type="date" class="form-control" id="doc3-tanggal" style="flex:1" />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" id="btn-generate-doc3">📄 Buat Dokumen 3 (PAK Final)</button>
          </div>
        </div>
      </div>

      <!-- Preview area -->
      <div id="doc-preview-area" class="mt-6 hidden"></div>
    `;

    App.setupDokumenEvents();
  },

  setupDokumenEvents() {
    // Tab switching
    document.querySelectorAll('#doc-tabs .tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#doc-tabs .tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
      });
    });

    // Doc 1: Load penilaian when dosen selected
    document.getElementById('doc1-pegawai').addEventListener('change', async () => {
      const pegawaiId = parseInt(document.getElementById('doc1-pegawai').value);
      const select = document.getElementById('doc1-penilaian');
      select.innerHTML = '<option value="">-- Pilih Penilaian --</option>';

      if (pegawaiId) {
        const penilaianList = await DB.getAllByIndex(DB.STORES.PENILAIAN, 'pegawai_id', pegawaiId);
        penilaianList.forEach(p => {
          select.innerHTML += `<option value="${p.id}">${p.tahun} — ${p.predikat} (${Utils.formatDisplay(p.angka_kredit_didapat)})</option>`;
        });
      }
    });

    // Generate Dokumen 1
    document.getElementById('btn-generate-doc1').addEventListener('click', async () => {
      const pegawaiId = parseInt(document.getElementById('doc1-pegawai').value);
      const penilaianId = parseInt(document.getElementById('doc1-penilaian').value);
      if (!pegawaiId || !penilaianId) {
        Utils.showToast('Silakan pilih dosen dan penilaian', 'warning');
        return;
      }

      const pegawai = await DB.getRecord(DB.STORES.PEGAWAI, pegawaiId);
      const penilaian = await DB.getRecord(DB.STORES.PENILAIAN, penilaianId);

      const pejabat = {
        nama_pejabat: document.getElementById('doc1-pejabat-nama').value,
        nip_pejabat: document.getElementById('doc1-pejabat-nip').value,
        jabatan_pejabat: document.getElementById('doc1-pejabat-jabatan').value,
      };

      const nomorSurat = document.getElementById('doc1-nomor-surat').value;
      const customPeriode = document.getElementById('doc1-periode-text').value;

      const html = Documents.generateDokumen1({
        pegawai, penilaian, pejabat,
        kota: document.getElementById('doc1-kota').value,
        tanggal: document.getElementById('doc1-tanggal').value,
        periodLabel: customPeriode || `${penilaian.tahun} — ${penilaian.periode_bulan || '12 Bulan'}`,
        nomorSurat,
      });

      Documents.openPrintPreview(html);
    });


    // Generate Dokumen 2
    document.getElementById('btn-generate-doc2').addEventListener('click', async () => {
      const pegawaiId = parseInt(document.getElementById('doc2-pegawai').value);
      if (!pegawaiId) { Utils.showToast('Silakan pilih dosen', 'warning'); return; }

      const pegawai = await DB.getRecord(DB.STORES.PEGAWAI, pegawaiId);
      const penilaianList = await DB.getAllByIndex(DB.STORES.PENILAIAN, 'pegawai_id', pegawaiId);

      const pejabat = {
        nama_pejabat: document.getElementById('doc2-pejabat-nama').value,
        nip_pejabat: document.getElementById('doc2-pejabat-nip').value,
        jabatan_pejabat: document.getElementById('doc2-pejabat-jabatan').value,
      };

      const html = Documents.generateDokumen2({
        pegawai, penilaianList,
        akIntegrasi: parseFloat(document.getElementById('doc2-ak-integrasi').value) || 0,
        pejabat,
        kota: document.getElementById('doc2-kota').value,
        tanggal: document.getElementById('doc2-tanggal').value,
      });

      Documents.openPrintPreview(html);
    });

    // Generate Dokumen 3
    document.getElementById('btn-generate-doc3').addEventListener('click', async () => {
      const pegawaiId = parseInt(document.getElementById('doc3-pegawai').value);
      if (!pegawaiId) { Utils.showToast('Silakan pilih dosen', 'warning'); return; }

      const pegawai = await DB.getRecord(DB.STORES.PEGAWAI, pegawaiId);
      const penilaianList = await DB.getAllByIndex(DB.STORES.PENILAIAN, 'pegawai_id', pegawaiId);

      const pejabat = {
        nama_pejabat: document.getElementById('doc3-pejabat-nama').value,
        nip_pejabat: document.getElementById('doc3-pejabat-nip').value,
        jabatan_pejabat: document.getElementById('doc3-pejabat-jabatan').value,
      };

      const html = Documents.generateDokumen3({
        pegawai, penilaianList, pejabat,
        kota: document.getElementById('doc3-kota').value,
        tanggal: document.getElementById('doc3-tanggal').value,
        nomorSurat: document.getElementById('doc3-nomor-surat').value,
        akDasar: document.getElementById('doc3-ak-dasar').value,
        akIntegrasi: document.getElementById('doc3-ak-integrasi').value,
        akPenyesuaian: document.getElementById('doc3-ak-penyesuaian').value,
        akPendidikan: document.getElementById('doc3-ak-pendidikan').value,
        akMinimalPangkat: document.getElementById('doc3-ak-min-pangkat').value,
        akMinimalJabatan: document.getElementById('doc3-ak-min-jabatan').value,
        akDasarLama: document.getElementById('doc3-ak-dasar-lama').value,
        akIntegrasiLama: document.getElementById('doc3-ak-integrasi-lama').value,
        akPenyesuaianLama: document.getElementById('doc3-ak-penyesuaian-lama').value,
        akKonversiLama: document.getElementById('doc3-ak-konversi-lama').value,
        akPendidikanLama: document.getElementById('doc3-ak-pendidikan-lama').value,
      });

      Documents.openPrintPreview(html);
    });
  },
};

// Boot
document.addEventListener('DOMContentLoaded', App.init);
