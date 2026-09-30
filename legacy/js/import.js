/**
 * PAK Konversi Dosen — Excel Import Module
 * Handles .xlsx file upload, parsing, validation, preview, and conflict resolution
 */

const ImportModule = {
  /**
   * Column mapping: Excel column header → database field
   * PRD §4 Modul A
   */
  COLUMN_MAP: {
    'NIP (*)': 'nip',
    'NIP': 'nip',
    'Nama Lengkap (*)': 'nama_lengkap',
    'Nama Lengkap': 'nama_lengkap',
    'No. Seri Karpeg': 'no_karpeg',
    'No Seri Karpeg': 'no_karpeg',
    'Tempat Lahir (*)': 'tempat_lahir',
    'Tempat Lahir': 'tempat_lahir',
    'Tanggal Lahir (*)': 'tanggal_lahir',
    'Tanggal Lahir': 'tanggal_lahir',
    'Jenis Kelamin (*)': 'jenis_kelamin',
    'Jenis Kelamin': 'jenis_kelamin',
    'Pangkat / Golongan (*)': 'pangkat_golongan',
    'Pangkat / Golongan': 'pangkat_golongan',
    'Pangkat/Golongan (*)': 'pangkat_golongan',
    'Pangkat/Golongan': 'pangkat_golongan',
    'TMT Pangkat (*)': 'tmt_pangkat',
    'TMT Pangkat': 'tmt_pangkat',
    'Jabatan Fungsional (*)': 'jabatan_fungsional',
    'Jabatan Fungsional': 'jabatan_fungsional',
    'TMT Jabatan (*)': 'tmt_jabatan',
    'TMT Jabatan': 'tmt_jabatan',
    'Unit Kerja (*)': 'unit_kerja',
    'Unit Kerja': 'unit_kerja',
  },

  /**
   * Parse uploaded Excel file
   * @param {File} file
   * @returns {Promise<Array>} parsed rows
   */
  async parseExcel(file) {
    return new Promise((resolve, reject) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Ukuran file melebihi batas 10MB'));
        return;
      }

      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        reject(new Error('Format file tidak valid. Silakan gunakan file .xlsx'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

          if (jsonData.length === 0) {
            reject(new Error('File Excel kosong atau tidak ada data'));
            return;
          }

          resolve(jsonData);
        } catch (err) {
          reject(new Error('Gagal membaca file Excel: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Map Excel rows to database fields
   */
  mapRows(rawRows) {
    return rawRows.map((row, index) => {
      const mapped = { _rowIndex: index + 2 }; // +2 for header row and 0-index

      for (const [excelCol, dbField] of Object.entries(ImportModule.COLUMN_MAP)) {
        if (row[excelCol] !== undefined) {
          let value = row[excelCol];

          // Handle date fields
          if (['tanggal_lahir', 'tmt_pangkat', 'tmt_jabatan'].includes(dbField)) {
            const dateObj = Utils.excelDateToJS(value);
            if (dateObj) {
              value = Utils.formatDateISO(dateObj);
            } else if (typeof value === 'string') {
              value = value.trim();
            }
          }

          // Handle NIP as string
          if (dbField === 'nip') {
            value = String(value).replace(/\.0$/, '').trim();
          }

          mapped[dbField] = value;
        }
      }

      return mapped;
    });
  },

  /**
   * Validate mapped rows
   * @returns {{ validRows: Array, invalidRows: Array }}
   */
  validateRows(mappedRows) {
    const validRows = [];
    const invalidRows = [];

    mappedRows.forEach((row) => {
      const result = Utils.validatePegawaiRow(row);
      if (result.valid) {
        validRows.push({ ...result.data, _rowIndex: row._rowIndex });
      } else {
        invalidRows.push({
          _rowIndex: row._rowIndex,
          errors: result.errors,
          originalData: row,
        });
      }
    });

    return { validRows, invalidRows };
  },

  /**
   * Check for NIP conflicts with existing data
   */
  async checkConflicts(validRows) {
    const newRows = [];
    const conflictRows = [];

    for (const row of validRows) {
      const existing = await DB.getByIndex(DB.STORES.PEGAWAI, 'nip', row.nip);
      if (existing) {
        conflictRows.push({
          newData: row,
          existingData: existing,
        });
      } else {
        newRows.push(row);
      }
    }

    return { newRows, conflictRows };
  },

  /**
   * Execute import with conflict resolution
   * @param {Array} newRows - New rows to add
   * @param {Array} conflictRows - Conflicting rows with resolution
   * @param {string} conflictAction - 'skip' or 'update'
   */
  async executeImport(newRows, conflictRows = [], conflictAction = 'skip') {
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Add new rows
    for (const row of newRows) {
      try {
        const { _rowIndex, ...data } = row;
        await DB.addRecord(DB.STORES.PEGAWAI, data);
        addedCount++;
      } catch (err) {
        errors.push({ row: row._rowIndex, error: err.message });
      }
    }

    // Handle conflicts
    for (const conflict of conflictRows) {
      if (conflictAction === 'update') {
        try {
          const { _rowIndex, ...newData } = conflict.newData;
          const updatedData = { ...conflict.existingData, ...newData };
          await DB.updateRecord(DB.STORES.PEGAWAI, updatedData);
          updatedCount++;
        } catch (err) {
          errors.push({ row: conflict.newData._rowIndex, error: err.message });
        }
      } else {
        skippedCount++;
      }
    }

    return { addedCount, updatedCount, skippedCount, errors };
  },

  /**
   * Generate error log CSV
   */
  generateErrorLog(invalidRows) {
    const headers = ['Baris', 'Kesalahan'];
    const rows = invalidRows.map(r => [r._rowIndex, `"${r.errors.join('; ')}"`]);

    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_error_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

window.ImportModule = ImportModule;
