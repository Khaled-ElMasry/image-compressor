
const widthInput = document.createElement('input');
const heightInput = document.createElement('input');
const lockRatioCheckbox = document.createElement('input');
const labelW = document.createElement('label');
const labelH = document.createElement('label');
const labelLock = document.createElement('label');

widthInput.type = 'number';
heightInput.type = 'number';
lockRatioCheckbox.type = 'checkbox';

labelW.textContent = 'Max Width';
labelH.textContent = 'Max Height';
labelLock.textContent = ' Lock Aspect Ratio';

document.body.insertBefore(labelW, qualityInput);
document.body.insertBefore(widthInput, qualityInput);
document.body.insertBefore(labelH, qualityInput);
document.body.insertBefore(heightInput, qualityInput);
document.body.insertBefore(labelLock, qualityInput);
document.body.insertBefore(lockRatioCheckbox, qualityInput);

const upload = document.getElementById('upload');
const dropzone = document.getElementById('dropzone');
const output = document.getElementById('output');
const qualityInput = document.getElementById('quality');
const downloadAll = document.getElementById('downloadAll');

let compressedBlobs = [];

upload.addEventListener('change', handleFiles);
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});
dropzone.addEventListener('dragover', e => e.preventDefault());

document.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.includes("image")) {
      handleFiles({ target: { files: [item.getAsFile()] } });
    }
  }
});


});

function handleFiles(e) {
  const files = e.target.files;
  Array.from(files).forEach(file => compressImage(file));
}

function compressImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      
      let [newWidth, newHeight] = [img.width, img.height];
      const maxWidth = parseInt(widthInput.value) || img.width;
      const maxHeight = parseInt(heightInput.value) || img.height;
      const lockRatio = lockRatioCheckbox.checked;

      if (lockRatio) {
        const ratio = img.width / img.height;
        if (img.width > maxWidth) {
          newWidth = maxWidth;
          newHeight = Math.round(maxWidth / ratio);
        }
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = Math.round(maxHeight * ratio);
        }
      } else {
        newWidth = Math.min(img.width, maxWidth);
        newHeight = Math.min(img.height, maxHeight);
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.getContext('2d').drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(blob => {
        const name = file.name.replace(/\.(\w+)$/, '-Comp.jpg');
        compressedBlobs.push({ blob, name });
        const url = URL.createObjectURL(blob);
        const imgEl = document.createElement('img');
        imgEl.src = url;
        output.appendChild(imgEl);
      }, 'image/jpeg', parseFloat(qualityInput.value));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

downloadAll.addEventListener('click', () => {
  if (compressedBlobs.length === 0) return;

  const zip = new JSZip();
  compressedBlobs.forEach(({ blob, name }) => {
    zip.file(name, blob);
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = "compressed_images.zip";
    a.click();
  });
});
