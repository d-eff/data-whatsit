let fileEle = document.querySelector('#file');
let progress = document.querySelector('#progress');
fileEle.addEventListener('change', onFileChange);

let data = [];
let headers = [];

function onFileChange() {
  let file = fileEle.files[0];

  if (file) {
    let reader = new FileReader();
    const fileSize = file.size;
    const chunkSize = Math.pow(2,13);
    let chunks = [];

    let offset = 0;
    let bytes = 0;

    reader.onloadend = function(e) {
      if (e.target.readyState === FileReader.DONE) {
        let chunk = e.target.result;
        bytes += chunk.length;

        chunks.push(chunk);
        progress.innerHTML = `<p>chunks: ${chunks.length} bytes: ${bytes}</p>`;
        
        if (offset < fileSize) {
          offset += chunkSize;
          let blob = file.slice(offset, offset + chunkSize);
          reader.readAsText(blob);
        } else {
          //we're done with this, reset it now in case we fail parsing
          fileEle.value = null;

          progress.innerHTML += `<p>LOAD COMPLETE.</p>`;
          data = parseFileData(chunks);

          //don't need this if we can get the headers loaded in via separate file
          headers = getHeaders(data);

          buildTable(data, headers);
        };
      }
    };
    //GO  
    let blob = file.slice(offset, offset + chunkSize);
    reader.readAsText(blob);
  }
}

function parseFileData(chunks) {
  progress.innerHTML += `<p>PARSING...</p>`;
  let content = chunks.join("");
  let contentArr = content.split('\n');

  return contentArr.map(ele => {
    try {
      return JSON.parse(ele);
    } catch (e) {
      return "";
    }
  }).filter(ele => typeof ele === "object");
}

function getHeaders(data) {
  progress.innerHTML += `<p>GETTING HEADERS...</p>`;
  let headers = [];

  data.forEach((ele, idx) => {
    let keys = Object.keys(ele);
    if (keys.length > headers.length) {
      headers = keys;
    }
  });

  return headers;
}

function buildTable(data, headers) {
  progress.innerHTML += `<p>BUILDING TABLE...</p>`;
  let thead = '';
  headers.forEach(ele => {
    //todo: is '' to `` a cast? how are those interpreted?
    thead += `<th>${ele}</th>`
  })
  
  let tbody = '';
  data.forEach(ele => {
    tbody += '<tr>'
    headers.forEach(header => {
      tbody += `<td>${ele.hasOwnProperty(header) ? ele[header] : ''}</td>`;
    });
    tbody += '</tr>'
  });

  let table = `<table>
                <thead><tr>${thead}</tr></thead>
                <tbody>${tbody}</tbody>
              </table>`;

  progress.innerHTML += `<p>DRAWING TABLE...</p>`;
  let container = document.querySelector('#tableWrap');
  container.innerHTML = table;
}