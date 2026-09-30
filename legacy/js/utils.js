/**
 * PAK Konversi Dosen — Utility Functions
 */

const Utils = {
  /**
   * Format number with specific decimal places (default 10 for AK precision)
   */
  formatDecimal(value, places = 10) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toFixed(places);
  },

  /**
   * Format number for display (4 decimal places)
   */
  formatDisplay(value, places = 4) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toFixed(places);
  },

  /**
   * Format number for document (10 decimal places as per PRD)
   */
  formatAK(value) {
    if (value === null || value === undefined || isNaN(value)) return '0.0000000000';
    return Number(value).toFixed(10);
  },

  /**
   * Format number using comma separator for Indonesian document standard
   */
  formatAKComma(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    let num = Number(value);
    let str = num.toFixed(9).replace(/\.?0+$/, '');
    return str.replace('.', ',');
  },

  /**
   * Format date to Indonesian format (dd MMMM yyyy)
   */
  formatDateID(dateStr) {
    if (!dateStr) return '-';
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /**
   * Format date to YYYY-MM-DD
   */
  formatDateISO(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  /**
   * Validate NIP (18 digits)
   */
  validateNIP(nip) {
    if (!nip) return { valid: false, message: 'NIP wajib diisi' };
    const cleaned = String(nip).trim();
    if (!/^\d{18}$/.test(cleaned)) {
      return { valid: false, message: 'NIP harus 18 digit angka' };
    }
    return { valid: true, value: cleaned };
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  validateDate(dateStr) {
    if (!dateStr) return { valid: false, message: 'Tanggal wajib diisi' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { valid: false, message: 'Format tanggal tidak valid' };
    }
    return { valid: true, value: Utils.formatDateISO(dateStr) };
  },

  /**
   * Validate jenis kelamin
   */
  validateJenisKelamin(value) {
    const v = String(value).trim().toUpperCase();
    if (v === 'L' || v === 'P') {
      return { valid: true, value: v };
    }
    return { valid: false, message: 'Jenis kelamin harus L atau P' };
  },

  /**
   * Validate jabatan fungsional
   */
  validateJabatan(value) {
    const valid = ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor'];
    const v = String(value).trim();
    const match = valid.find(j => j.toLowerCase() === v.toLowerCase());
    if (match) {
      return { valid: true, value: match };
    }
    return { valid: false, message: `Jabatan fungsional harus salah satu: ${valid.join(', ')}` };
  },

  /**
   * Validate required text field
   */
  validateRequired(value, fieldName) {
    const v = String(value || '').trim();
    if (!v) {
      return { valid: false, message: `${fieldName} wajib diisi` };
    }
    return { valid: true, value: v };
  },

  /**
   * Validate a pegawai row (for Excel import)
   */
  validatePegawaiRow(row) {
    const errors = [];
    const data = {};

    // NIP
    const nipResult = Utils.validateNIP(row.nip);
    if (!nipResult.valid) errors.push(nipResult.message);
    else data.nip = nipResult.value;

    // Nama Lengkap
    const namaResult = Utils.validateRequired(row.nama_lengkap, 'Nama Lengkap');
    if (!namaResult.valid) errors.push(namaResult.message);
    else data.nama_lengkap = namaResult.value;

    // Tempat Lahir
    const tempatResult = Utils.validateRequired(row.tempat_lahir, 'Tempat Lahir');
    if (!tempatResult.valid) errors.push(tempatResult.message);
    else data.tempat_lahir = tempatResult.value;

    // Tanggal Lahir
    const tglLahirResult = Utils.validateDate(row.tanggal_lahir);
    if (!tglLahirResult.valid) errors.push('Tanggal Lahir: ' + tglLahirResult.message);
    else data.tanggal_lahir = tglLahirResult.value;

    // Jenis Kelamin
    const jkResult = Utils.validateJenisKelamin(row.jenis_kelamin);
    if (!jkResult.valid) errors.push(jkResult.message);
    else data.jenis_kelamin = jkResult.value;

    // Pangkat/Golongan
    const pangkatResult = Utils.validateRequired(row.pangkat_golongan, 'Pangkat/Golongan');
    if (!pangkatResult.valid) errors.push(pangkatResult.message);
    else data.pangkat_golongan = pangkatResult.value;

    // TMT Pangkat
    const tmtPangkatResult = Utils.validateDate(row.tmt_pangkat);
    if (!tmtPangkatResult.valid) errors.push('TMT Pangkat: ' + tmtPangkatResult.message);
    else data.tmt_pangkat = tmtPangkatResult.value;

    // Jabatan Fungsional
    const jabatanResult = Utils.validateJabatan(row.jabatan_fungsional);
    if (!jabatanResult.valid) errors.push(jabatanResult.message);
    else data.jabatan_fungsional = jabatanResult.value;

    // TMT Jabatan
    const tmtJabatanResult = Utils.validateDate(row.tmt_jabatan);
    if (!tmtJabatanResult.valid) errors.push('TMT Jabatan: ' + tmtJabatanResult.message);
    else data.tmt_jabatan = tmtJabatanResult.value;

    // Unit Kerja
    const unitResult = Utils.validateRequired(row.unit_kerja, 'Unit Kerja');
    if (!unitResult.valid) errors.push(unitResult.message);
    else data.unit_kerja = unitResult.value;

    // Optional: No. Seri Karpeg
    data.no_karpeg = String(row.no_karpeg || '').trim();

    return {
      valid: errors.length === 0,
      errors,
      data
    };
  },

  /**
   * Generate a unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Parse Excel date serial number to JS Date
   */
  excelDateToJS(serial) {
    if (!serial) return null;
    // If already a string date, try parsing directly
    if (typeof serial === 'string') {
      const d = new Date(serial);
      return isNaN(d.getTime()) ? null : d;
    }
    // Excel serial number
    if (typeof serial === 'number') {
      const utc_days = Math.floor(serial - 25569);
      const date = new Date(utc_days * 86400 * 1000);
      return date;
    }
    return null;
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${Utils.escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
    `;
    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  },

  /**
   * Get jenis kelamin label
   */
  jenisKelaminLabel(value) {
    return value === 'L' ? 'Laki-laki' : value === 'P' ? 'Perempuan' : '-';
  },

  /**
   * Month names in Indonesian
   */
  BULAN: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ],
};

window.Utils = Utils;
