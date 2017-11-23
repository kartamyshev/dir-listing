async function getDirectories() {
  const response = await fetch('./data/dir_listing.json');
  return await response.json();
}

async function getFileContents() {
  const response = await fetch('./data/file.json');
  return await response.json();
}

let file = undefined,
  cached = file !== undefined,
  $contentArea,
  contentAreaInitialText;

const extension = filename => filename.split('.')[1];

document.addEventListener('DOMContentLoaded', () => {
  $contentArea = document.querySelector('.content-area')
  contentAreaInitialText = $contentArea.innerText;
});

function updateContentArea(content) {
  if (content) {
    $contentArea.innerText = content;
    $contentArea.classList.remove('empty');
  } else {
    $contentArea.innerText = contentAreaInitialText;
    $contentArea.classList.add('empty');
  }
}

getDirectories()
  .then(directories => {
    document.querySelector('.directories').innerHTML = generateMenu(directories);
  });

function generateMenu(directories) {
  return Object.keys(directories).map(directory => {
    return `
      <div class="single-directory" data-closed=${true} onclick="toggle(${directory})">
        <div class="single-directory-title">
          ${directories[directory].displayName}
        </div>
      </div>
    `;
  }).join('');
}

function handleFileClick(content, event) {
  event.stopPropagation();
  updateContentArea(content);
  const active = event.target.classList.contains('active');
  active
    ? event.target.classList.remove('active')
    : event.target.classList.add('active');
}

function createFileDiv({ fileName, content }) {
  const $fileDiv = document.createElement('div');
  $fileDiv.className = `file-with-extension extension-${extension(fileName)}`;
  $fileDiv.innerText = fileName;
  $fileDiv.onclick = handleFileClick.bind(null, content);
  return $fileDiv;
}

async function toggle(index) {
  const dirs = document.querySelectorAll('.single-directory');
  const target = dirs[index];
  const closed = target.getAttribute('data-closed') === "true";
  dirs.forEach(node => {
    node.setAttribute('data-closed', true);
  });
  const fileStructureElement = document.createElement('div');
  if (closed) {
    target.insertAdjacentElement('beforeEnd', fileStructureElement);
    fileStructureElement.className = 'file-structure';

    if (cached === true) {
      fileStructureElement.appendChild(createFileDiv(file));
    } else {
      getFileContents()
        .then(data => {
          fileStructureElement.appendChild(createFileDiv(data));
          file = data;
          cached = true;
        });
    }
  } else {
    const filenameElement = document.querySelector('.file-structure')
    filenameElement.parentNode.removeChild(filenameElement);
    updateContentArea();
  }
  target.setAttribute('data-closed', !closed);
}
