// /public/js/admin-images.js
// Image Manager: 15-zone grid, optimize -> upload -> Firestore
// Uses modular Firebase SDK (matches firebase.js)

const IMAGE_ZONES = [
  { key: 'home-hero',            label: 'Homepage Hero',              page: 'Homepage' },
  { key: 'home-world-bodyshop',  label: 'World Card: Body Shop',      page: 'Homepage' },
  { key: 'home-world-shop',      label: 'World Card: Shop',           page: 'Homepage' },
  { key: 'home-world-blue',      label: 'World Card: Blue',           page: 'Homepage' },
  { key: 'home-world-turo',      label: 'World Card: Turo',           page: 'Homepage' },
  { key: 'home-world-content',   label: 'World Card: Content',        page: 'Homepage' },
  { key: 'home-world-coaching',  label: 'World Card: Coaching',       page: 'Homepage' },
  { key: 'home-blue-section',    label: 'Blue Section',               page: 'Homepage' },
  { key: 'bodyshop-hero',        label: 'Body Shop Hero',             page: 'Body Shop' },
  { key: 'shop-hero',            label: 'Shop Hero',                  page: 'Shop' },
  { key: 'blue-hero',            label: "Blue's World Hero",          page: "Blue's World" },
  { key: 'turo-hero',            label: 'Turo Hero',                  page: 'Turo' },
  { key: 'content-hero',         label: 'Content Hero',               page: 'Content' },
  { key: 'coaching-hero',        label: 'Coaching Hero',              page: 'Coaching' },
  { key: 'about-chelsea',        label: 'Chelsea Portrait',           page: 'Reusable' },
];

const MAX_EDGE = 2000;
const WEBP_QUALITY = 0.85;

// Firebase module references — loaded once on init
let _db = null;
let _storage = null;
let _firestoreMod = null;
let _storageMod = null;

async function ensureFirebase() {
  if (_db && _storage) return;
  const { initializeApp, getApps } = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
  );
  _firestoreMod = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
  );
  _storageMod = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js"
  );
  const firebaseConfig = {
    apiKey: "AIzaSyCR0IAighT6BtycEJa9VaRbZNYcZQuIYAw",
    authDomain: "chelsea-by-the-sea.firebaseapp.com",
    projectId: "chelsea-by-the-sea",
    storageBucket: "chelsea-by-the-sea.firebasestorage.app",
    messagingSenderId: "976355830273",
    appId: "1:976355830273:web:fd5a6ef43ca9c6a124ee00"
  };
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  _db = _firestoreMod.getFirestore(app);
  _storage = _storageMod.getStorage(app);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'image';
}

function bytesToReadable(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function loadImage(file) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    img.onload = function() { resolve(img); };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function optimizeImage(file) {
  var img = await loadImage(file);
  var scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  var w = Math.round(img.width * scale);
  var h = Math.round(img.height * scale);

  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  var blob = await new Promise(function(resolve) {
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY);
  });

  URL.revokeObjectURL(img.src);

  if (!blob) return { blob: file, ext: file.name.split('.').pop() || 'jpg', optimized: false };
  return { blob: blob, ext: 'webp', optimized: true, width: w, height: h };
}

async function getImagesConfig() {
  await ensureFirebase();
  var snap = await _firestoreMod.getDoc(
    _firestoreMod.doc(_db, 'config', 'images')
  );
  return snap.exists() ? snap.data() : {};
}

async function saveZoneToFirestore(zoneKey, data) {
  await ensureFirebase();
  await _firestoreMod.setDoc(
    _firestoreMod.doc(_db, 'config', 'images'),
    { [zoneKey]: { ...data, uploadedAt: _firestoreMod.serverTimestamp() } },
    { merge: true }
  );
}

async function deleteZoneInFirestore(zoneKey) {
  await ensureFirebase();
  await _firestoreMod.setDoc(
    _firestoreMod.doc(_db, 'config', 'images'),
    { [zoneKey]: _firestoreMod.deleteField() },
    { merge: true }
  );
}

async function deleteStorageFile(path) {
  if (!path) return;
  await ensureFirebase();
  try {
    var fileRef = _storageMod.ref(_storage, path);
    await _storageMod.deleteObject(fileRef);
  } catch (e) {
    console.warn('Storage delete failed (may not exist):', path, e.message);
  }
}

function renderZoneCard(zone, current) {
  var hasImage = current && current.url;
  return '<div class="image-zone-card" data-zone="' + zone.key + '">' +
    '<div class="image-zone-header">' +
      '<div>' +
        '<div class="image-zone-label">' + zone.label + '</div>' +
        '<div class="image-zone-page">' + zone.page + '</div>' +
      '</div>' +
      '<code class="image-zone-key">' + zone.key + '</code>' +
    '</div>' +
    '<div class="image-zone-preview">' +
      (hasImage
        ? '<img src="' + current.url + '" alt="' + zone.label + '" loading="lazy" />'
        : '<div class="image-zone-empty">No image uploaded</div>') +
    '</div>' +
    '<div class="image-zone-meta">' +
      (hasImage ? '<span>' + (current.filename || '') + '</span>' : '') +
    '</div>' +
    '<div class="image-zone-progress" hidden>' +
      '<div class="image-zone-progress-bar"></div>' +
      '<div class="image-zone-progress-text">0%</div>' +
    '</div>' +
    '<div class="image-zone-stats" hidden></div>' +
    '<div class="image-zone-actions">' +
      '<label class="btn btn-primary">' +
        (hasImage ? 'Replace' : 'Upload') +
        '<input type="file" accept="image/*" hidden data-upload="' + zone.key + '" />' +
      '</label>' +
      (hasImage ? '<button class="btn btn-danger" data-delete="' + zone.key + '">Delete</button>' : '') +
    '</div>' +
  '</div>';
}

async function renderGrid(container) {
  container.innerHTML = '<div class="image-grid-loading">Loading images...</div>';
  var config = await getImagesConfig();
  var html = '<div class="image-grid">';
  for (var i = 0; i < IMAGE_ZONES.length; i++) {
    html += renderZoneCard(IMAGE_ZONES[i], config[IMAGE_ZONES[i].key]);
  }
  html += '</div>';
  container.innerHTML = html;
  wireGridEvents(container);
}

function wireGridEvents(container) {
  container.querySelectorAll('input[type="file"][data-upload]').forEach(function(input) {
    input.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (file) handleUpload(e.target.dataset.upload, file, container);
      e.target.value = '';
    });
  });

  container.querySelectorAll('button[data-delete]').forEach(function(btn) {
    btn.addEventListener('click', async function(e) {
      var zoneKey = e.target.dataset.delete;
      if (!confirm('Delete the image for "' + zoneKey + '"? This cannot be undone.')) return;
      await handleDelete(zoneKey, container);
    });
  });
}

async function handleUpload(zoneKey, file, container) {
  await ensureFirebase();

  var card = container.querySelector('.image-zone-card[data-zone="' + zoneKey + '"]');
  var progressEl = card.querySelector('.image-zone-progress');
  var progressBar = card.querySelector('.image-zone-progress-bar');
  var progressText = card.querySelector('.image-zone-progress-text');
  var statsEl = card.querySelector('.image-zone-stats');

  progressEl.hidden = false;
  progressBar.style.width = '0%';
  progressText.textContent = 'Optimizing...';
  statsEl.hidden = true;

  try {
    var originalSize = file.size;
    var result = await optimizeImage(file);

    statsEl.hidden = false;
    statsEl.innerHTML = result.optimized
      ? 'Original: ' + bytesToReadable(originalSize) + ' &rarr; Optimized: ' + bytesToReadable(result.blob.size) + ' (' + result.width + '&times;' + result.height + ')'
      : 'Uploading original: ' + bytesToReadable(originalSize);

    var timestamp = Date.now();
    var filename = timestamp + '-' + slugify(file.name) + '.' + result.ext;
    var path = 'site-images/' + zoneKey + '/' + filename;
    var fileRef = _storageMod.ref(_storage, path);

    progressText.textContent = 'Uploading...';

    var uploadTask = _storageMod.uploadBytesResumable(fileRef, result.blob, {
      contentType: result.ext === 'webp' ? 'image/webp' : file.type
    });

    await new Promise(function(resolve, reject) {
      uploadTask.on('state_changed',
        function(snap) {
          var pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          progressBar.style.width = pct + '%';
          progressText.textContent = pct + '%';
        },
        function(err) { reject(err); },
        function() { resolve(); }
      );
    });

    var url = await _storageMod.getDownloadURL(fileRef);

    // Get old path before overwriting
    var existing = await getImagesConfig();
    var oldPath = existing[zoneKey] && existing[zoneKey].path;

    await saveZoneToFirestore(zoneKey, { url: url, path: path, filename: filename });

    // Delete old file after successful swap
    if (oldPath && oldPath !== path) {
      await deleteStorageFile(oldPath);
    }

    progressText.textContent = 'Done';
    await renderGrid(container);
  } catch (err) {
    console.error('Upload error:', err);
    alert('Upload failed: ' + err.message);
    progressEl.hidden = true;
  }
}

async function handleDelete(zoneKey, container) {
  try {
    var existing = await getImagesConfig();
    var oldPath = existing[zoneKey] && existing[zoneKey].path;
    await deleteZoneInFirestore(zoneKey);
    if (oldPath) await deleteStorageFile(oldPath);
    await renderGrid(container);
  } catch (err) {
    console.error(err);
    alert('Delete failed: ' + err.message);
  }
}

// Public API
window.initImageManager = function(containerSelector) {
  var container = document.querySelector(containerSelector);
  if (!container) {
    console.warn('Image manager container not found:', containerSelector);
    return;
  }
  renderGrid(container);
};
