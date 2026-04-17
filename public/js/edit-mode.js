// /public/js/edit-mode.js
// Inline live-edit mode for admin users. Images + text.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR0IAighT6BtycEJa9VaRbZNYcZQuIYAw",
  authDomain: "chelsea-by-the-sea.firebaseapp.com",
  projectId: "chelsea-by-the-sea",
  storageBucket: "chelsea-by-the-sea.firebasestorage.app",
  messagingSenderId: "976355830273",
  appId: "1:976355830273:web:fd5a6ef43ca9c6a124ee00"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let editModeActive = false;
let activeTextEdit = null; // { el, originalText, toolbar }

// ── TOAST ──
function showToast(msg, isError) {
  const t = document.createElement('div');
  t.className = 'cbts-toast' + (isError ? ' cbts-toast--error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ── IMAGE OPTIMIZATION ──
function loadImg(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function optimizeImage(file) {
  const img = await loadImg(file);
  const MAX = 2000;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  let blob = await new Promise(r => canvas.toBlob(r, 'image/webp', 0.85));
  let ext = 'webp';
  let type = 'image/webp';
  if (!blob) {
    blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    ext = 'jpg';
    type = 'image/jpeg';
  }
  if (!blob) return { blob: file, type: file.type, ext: file.name.split('.').pop(), originalSize: file.size, optimizedSize: file.size, width: w, height: h };
  return { blob, type, ext, originalSize: file.size, optimizedSize: blob.size, width: w, height: h };
}

function safeName(name) {
  return name.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'image';
}

// ── IMAGE MODAL ──
function openImageModal(zoneKey) {
  let optimized = null;
  const modal = document.createElement('div');
  modal.className = 'cbts-image-modal';
  modal.innerHTML = `
    <div class="cbts-image-modal-card">
      <div class="cbts-image-modal-title">Replace image</div>
      <div class="cbts-image-modal-zone">${zoneKey}</div>
      <div class="cbts-dropzone" id="cbts-dz">
        <div class="cbts-dropzone-text">
          <strong>Click to choose</strong> or drag a file here
        </div>
        <input type="file" accept="image/*" hidden id="cbts-file-input">
      </div>
      <div class="cbts-preview-area" id="cbts-preview-area">
        <img class="cbts-preview-img" id="cbts-preview-img">
        <div class="cbts-preview-stats" id="cbts-preview-stats"></div>
      </div>
      <div class="cbts-modal-actions">
        <button class="cbts-modal-cancel" id="cbts-modal-cancel">Cancel</button>
        <button class="cbts-modal-upload" id="cbts-modal-upload" disabled>Upload</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const dz = modal.querySelector('#cbts-dz');
  const fileInput = modal.querySelector('#cbts-file-input');
  const previewArea = modal.querySelector('#cbts-preview-area');
  const previewImg = modal.querySelector('#cbts-preview-img');
  const previewStats = modal.querySelector('#cbts-preview-stats');
  const uploadBtn = modal.querySelector('#cbts-modal-upload');
  const cancelBtn = modal.querySelector('#cbts-modal-cancel');

  function close() { modal.remove(); }

  dz.addEventListener('click', () => fileInput.click());
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragging'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragging'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault(); dz.classList.remove('dragging');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  cancelBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  async function handleFile(file) {
    dz.querySelector('.cbts-dropzone-text').textContent = 'Optimizing...';
    optimized = await optimizeImage(file);
    previewImg.src = URL.createObjectURL(optimized.blob);
    const origKB = (optimized.originalSize / 1024).toFixed(1);
    const optKB = (optimized.optimizedSize / 1024).toFixed(1);
    previewStats.textContent = `Original: ${origKB} KB → Optimized: ${optKB} KB (${optimized.width}×${optimized.height} ${optimized.ext})`;
    previewArea.style.display = 'block';
    dz.style.display = 'none';
    uploadBtn.disabled = false;
  }

  uploadBtn.addEventListener('click', async () => {
    if (!optimized) return;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    try {
      const filename = Date.now() + '-' + safeName(fileInput.files[0]?.name || 'upload') + '.' + optimized.ext;
      const path = 'site-images/' + zoneKey + '/' + filename;
      const fileRef = ref(storage, path);
      await uploadBytesResumable(fileRef, optimized.blob, { contentType: optimized.type });
      const url = await getDownloadURL(fileRef);
      await setDoc(doc(db, 'config', 'images'), {
        [zoneKey]: { url, path, filename, uploadedAt: serverTimestamp() }
      }, { merge: true });
      if (window.ChelseaLiveContent) window.ChelseaLiveContent.refresh();
      showToast('Image saved — live on site');
      close();
    } catch (err) {
      showToast('Upload failed: ' + err.message, true);
      uploadBtn.textContent = 'Upload';
      uploadBtn.disabled = false;
    }
  });
}

// ── TEXT EDITING ──
function startTextEdit(el) {
  if (activeTextEdit) cancelTextEdit();
  const zoneKey = el.dataset.textZone;
  const originalText = el.textContent;
  el.setAttribute('data-original-text', originalText);
  el.contentEditable = 'true';
  el.focus();
  // Place cursor at end
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'cbts-text-toolbar';
  toolbar.innerHTML = '<button class="cbts-tb-save">Save</button><button class="cbts-tb-cancel">Cancel</button>';
  document.body.appendChild(toolbar);
  positionToolbar(toolbar, el);

  toolbar.querySelector('.cbts-tb-save').addEventListener('click', () => saveTextEdit());
  toolbar.querySelector('.cbts-tb-cancel').addEventListener('click', () => cancelTextEdit());

  activeTextEdit = { el, originalText, toolbar, zoneKey };
}

function positionToolbar(toolbar, el) {
  const rect = el.getBoundingClientRect();
  toolbar.style.left = rect.left + 'px';
  toolbar.style.top = (rect.top - 40 + window.scrollY) + 'px';
}

async function saveTextEdit() {
  if (!activeTextEdit) return;
  const { el, toolbar, zoneKey } = activeTextEdit;
  const newText = el.textContent.trim();
  el.contentEditable = 'false';
  toolbar.remove();
  try {
    await setDoc(doc(db, 'config', 'text'), { [zoneKey]: newText }, { merge: true });
    showToast('Text saved');
  } catch (err) {
    showToast('Save failed: ' + err.message, true);
  }
  activeTextEdit = null;
}

function cancelTextEdit() {
  if (!activeTextEdit) return;
  const { el, originalText, toolbar } = activeTextEdit;
  el.textContent = originalText;
  el.contentEditable = 'false';
  toolbar.remove();
  activeTextEdit = null;
}

// ── TOGGLE ──
function createToggle() {
  const btn = document.createElement('button');
  btn.className = 'cbts-edit-toggle cbts-edit-toggle--visible';
  btn.innerHTML = '&#9998;'; // pencil
  btn.title = 'Toggle Edit Mode (Cmd+Shift+E)';
  btn.addEventListener('click', toggleEditMode);
  document.body.appendChild(btn);
  // Restore from session
  if (sessionStorage.getItem('cbtsEditMode') === 'on') {
    activateEditMode(btn);
  }
  return btn;
}

function toggleEditMode() {
  const btn = document.querySelector('.cbts-edit-toggle');
  if (editModeActive) {
    deactivateEditMode(btn);
  } else {
    activateEditMode(btn);
  }
}

function activateEditMode(btn) {
  editModeActive = true;
  document.body.classList.add('cbts-edit-mode');
  if (btn) btn.classList.add('cbts-edit-toggle--active');
  sessionStorage.setItem('cbtsEditMode', 'on');
}

function deactivateEditMode(btn) {
  editModeActive = false;
  document.body.classList.remove('cbts-edit-mode');
  if (btn) btn.classList.remove('cbts-edit-toggle--active');
  sessionStorage.setItem('cbtsEditMode', 'off');
  if (activeTextEdit) cancelTextEdit();
  document.querySelector('.cbts-image-modal')?.remove();
}

// ── DELEGATED CLICK HANDLERS ──
document.body.addEventListener('click', (e) => {
  if (!editModeActive) return;

  // Image zone click
  const imgZone = e.target.closest('[data-image-zone]');
  if (imgZone) {
    e.preventDefault();
    e.stopPropagation();
    openImageModal(imgZone.dataset.imageZone);
    return;
  }

  // Text zone click
  const textZone = e.target.closest('[data-text-zone]');
  if (textZone && textZone.contentEditable !== 'true') {
    e.preventDefault();
    e.stopPropagation();
    startTextEdit(textZone);
    return;
  }

  // Click outside active text edit = save
  if (activeTextEdit && !e.target.closest('[data-text-zone]') && !e.target.closest('.cbts-text-toolbar')) {
    saveTextEdit();
  }
}, true);

// Esc to cancel text edit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeTextEdit) {
    cancelTextEdit();
  }
  // Cmd+Shift+E / Ctrl+Shift+E
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e') {
    e.preventDefault();
    toggleEditMode();
  }
});

// ── INIT ──
window.addEventListener('admin-auth-ready', (e) => {
  if (!e.detail.isAdmin) return;
  createToggle();
});
