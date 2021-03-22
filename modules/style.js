/** Loads a stylesheet immediately. */
const loadStyle = url => {
  fetch(url).then(r => r.text()).then(t => {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(t));
    return document.head.appendChild(style);
  })
  .catch(error => {
    console.warn(`Failed to load ${url}`, error.message);
  });
}
(function() { loadStyle(`./skin/default.css`) })();