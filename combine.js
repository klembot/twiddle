// This import is to avoid importing the path module which needs a bunch of Node
// builtins.
import {Story} from 'twine-utils/dist/esm/story.js';
import {readFile, saveFile} from './file.js';

const form = document.querySelector('#combine');
const sourcesInput = document.querySelector('#combine-sources');
const startFileContainer = document.querySelector(
  '#combine-start-file-container'
);
const startFileInput = document.querySelector('#combine-start-file');
const submitButton = form.querySelector('#combine-submit');

/**
 * @type File[]
 */
let files = [];

/**
 * @param files {File[]} files to merge
 * @param startStoryIndex {number} index of the file to use as starting point
 */
async function mergeFiles(files, startStoryIndex) {
  const start = files[startStoryIndex];
  const startSource = await readFile(start);
  const others = [...files];

  others.splice(startStoryIndex, 1);

  // Merge the stories together.

  let result = Story.fromHTML(startSource);

  for (const story of others) {
    result.mergeStory(Story.fromHTML(await readFile(story)));
  }

  // Replace the <tw-storydata> tag in the start story's full source with the
  // published version of the merged story.

  return startSource.replace(
    /<tw-storydata>[\s\S]*<\/tw-storydata>/im,
    result.toHTML()
  );
}

sourcesInput.addEventListener('change', event => {
  files = Array.from(event.target.files ?? []);

  if (files.length > 0) {
    startFileContainer.removeAttribute('hidden');
    startFileInput.innerHTML = files
      .map((file, index) => `<option value="${index}">${file.name}</option>`)
      .join('');
    startFileInput.selectedIndex = 0;
    submitButton.removeAttribute('disabled');
  } else {
    startFileContainer.setAttribute('hidden', '');
    submitButton.setAttribute('disabled', '');
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (files.length === 0) {
    return;
  }

  try {
    saveFile(
      await mergeFiles(files, startFileInput.selectedIndex),
      'Merged Story.html',
      'text/html'
    );
  } catch (error) {
    window.alert(`Something went wrong while combining: ${error.message}`);
  }
});
