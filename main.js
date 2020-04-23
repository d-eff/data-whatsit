let fileEle = document.querySelector('#file');
fileEle.addEventListener('change', onFileChange);

let data = [];
let headers = [];

function onFileChange() {
  let file = fileEle.files[0];
  let progress = document.querySelector('#progress');

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
        progress.innerHTML = `chunks: ${chunks.length} bytes: ${bytes}`;
        
        if (offset < fileSize) {
          offset += chunkSize;
          let blob = file.slice(offset, offset + chunkSize);
          reader.readAsText(blob);
        } else {
          //we're done with this, reset it now in case we fail parsing
          fileEle.value = null;

          progress.innerHTML = `chunks: ${chunks.length} bytes: ${bytes} COMPLETE`;
          data = parseFileData(chunks);

          //don't need this if we can get the headers loaded in via separate file
          headers = getHeaders(data);

          //hello
          // buildTable(data, headers);
        };
      }
    };
    //GO  
    let blob = file.slice(offset, offset + chunkSize);
    reader.readAsText(blob);
  }
}

function parseFileData(chunks) {
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
  let headers = [];

  data.forEach((ele, idx) => {
    let keys = Object.keys(ele);
    if (keys.length > headers.length) {
      headers = keys;
    }
  });

  return headers;
}
