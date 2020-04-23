let fileEle = document.querySelector('#file');
let progress = document.querySelector('#progress');
let tableContainer = document.querySelector('#tableWrap');
fileEle.addEventListener('change', onFileChange);

let data = [];
let headers = {};

function onFileChange() {
  //reset
  data = [];
  headers = [];
  tableContainer.innerHTML = '';

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
          data = parseFileData(chunks);

          //don't need this if we can get the headers loaded in via separate file
          headers = getHeaders(data);

          //todo: yes we store them globally but I think I have a plan
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
  let content = chunks.join('');
  let contentArr = content.split('\n');

  return contentArr.map(ele => {
    try {
      return JSON.parse(ele);
    } catch (e) {
      return '';
    }
  }).filter(ele => typeof ele === 'object');
}

function getHeadersFromSample(data) {
  let headers = {};

  let keys = Object.keys(data);
  keys.forEach(key => {
    let item = data[key];
    headers[key] = (typeof item === 'object' && !Array.isArray(item)) ? getHeadersFromSample(data[key]) : '';
  });

  return headers;
}

function getHeaders(data) {
  let headers = {};

  data.forEach((ele, idx) => {
    let sampleHeaders = getHeadersFromSample(ele);
    //this is all hilariously costly, I think
    if (JSON.stringify(headers) !== JSON.stringify(sampleHeaders)) {
      headers = Object.assign(headers, sampleHeaders);
    }
  });

  return headers;
}

function buildTableHead(headers) {
  let thead = '';
  let headKeys = Object.keys(headers);
  headKeys.forEach(ele => {
    //minor: is '' to `` a cast? how are those interpreted?
    //todo: TCO all this recursion
    if (typeof headers[ele] === 'object') {
      thead += buildTableHead(headers[ele]);
    } else {
      thead += `<th>${ele}</th>`
    }
  })
  return thead;
}

function buildTableRow(data, headers) {
  let row = '';
  let headKeys = Object.keys(headers);
  headKeys.forEach(header => {
    if (typeof headers[header] === 'object') {
      row += buildTableRow(data[header] || {}, headers[header]);
    } else {
      row += `<td>${data[header] || ''}</td>`;
    }
  });
  return row;
}

function buildTableBody(data, headers) {
  let tbody = '';
  data.forEach(ele => {
    tbody += `<tr>${buildTableRow(ele, headers)}</tr>`
  });
  return tbody;
}

function buildTable(data, headers) {
  let thead = buildTableHead(headers);
  
  let tbody = buildTableBody(data, headers);

  let table = `<table>
                <thead><tr>${thead}</tr></thead>
                <tbody>${tbody}</tbody>
              </table>`;
  tableContainer.innerHTML = table;
}