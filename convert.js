// This import is to avoid importing the path module which needs a bunch of Node
// builtins.
import {Story} from 'twine-utils/dist/esm/story.js';
import {readFile, saveFile} from './file.js';

/**
 * @type Story
 */
let inputStory;

/**
 * @type string
 */
let inputStatus;

const formatDescriptions = {
  html: "A HTML file that can be imported into Twine 2. This can't be played directly in a browser.",
  json: "A dump of the story structure as-is. This format can't be used in Twine directly, but can be imported by a variety of applications.",
  twee: 'A plain text file that can be imported into Twine 2, Tweego, and other tools.'
};
const convertStep = document.querySelector('#convert-format-step');
const fileInput = document.querySelector('#convert-input-file');
const select = document.querySelector('#convert-output-format');
const status = document.querySelector('#convert-input-status');
const submitButton = document.querySelector('#convert-submit');

function updateUI() {
  if (inputStatus) {
    status.innerHTML = `This looks like ${inputStatus}${
      inputStory ? ` with ${inputStory.passages.length} passages` : ''
    }.`;
  }

  if (inputStory) {
    convertStep.removeAttribute('hidden');
    submitButton.removeAttribute('disabled');
  } else {
    convertStep.setAttribute('hidden', '');
    submitButton.setAttribute('disabled', null);
  }

  const format = select.options[select.selectedIndex].value;

  document.querySelector('#convert-format-description').innerHTML =
    formatDescriptions[format];
}

/**
 * @param format {'html' | 'json' | 'twee'}
 */
async function convertStory(format) {
  let mimeType = '';
  let source = '';

  switch (format) {
    case 'html':
      mimeType = 'text/html';
      source = inputStory.toHTML();
      break;
    case 'json':
      mimeType = 'text/json';
      source = JSON.stringify(inputStory);
      break;
    case 'twee':
      mimeType = 'text/plain';
      source = inputStory.toTwee();
      break;
  }

  saveFile(source, `${inputStory.attributes.name}.${format}`, mimeType);
}

fileInput.addEventListener('change', async event => {
  /**
   * @type File
   */
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const extension = /\..*$/.exec(file.name);

  switch (extension[0]) {
    case '.html':
      const source = await readFile(file);
      const html = document.createElement('div');

      html.innerHTML = source;

      const twineVersion = html.querySelector('div#storeArea') ? 1 : 2;

      inputStory = Story.fromHTML(source, twineVersion);
      inputStatus = `a HTML Twine ${twineVersion} story`;
      updateUI();
      break;

    case '.txt':
    case '.twee':
      inputStory = Story.fromTwee(await readFile(file));
      inputStatus = 'a Twee plain text file';
      updateUI();
      break;

    case '.tws':
      inputStory = Story.fromTWS(new Uint8Array(await readFile(file, true)));
      inputStatus = `a Twine 1 story in editable form`;
      updateUI();
      break;

    default:
      inputStory = undefined;
      inputStatus = 'an unrecognized file type';
      updateUI();
  }
});

submitButton.addEventListener('click', event => {
  event.preventDefault();

  try {
    convertStory(select.options[select.selectedIndex].value);
  } catch (error) {
    window.alert(`Something went wrong while converting: ${error.message}`);
  }
});

select.addEventListener('change', updateUI);

// Clear the file input so that any previous values (which we can't see) are removed.

fileInput.value = '';
updateUI();
