let fileEle = document.getElementById('file');
fileEle.addEventListener('change', onFileChange);

function onFileChange() {
  let file = fileEle.files[0];
  let progress = document.getElementById('progress');

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
          progress.innerHTML = `chunks: ${chunks.length} bytes: ${bytes} COMPLETE`;
          let data = parseFileData(chunks);
          let headers = getHeaders(data);

          //hello
          console.log(data);
          fileEle.value = null;
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

  return contentArr.map((ele) => {
    try {
      return JSON.parse(ele);
    } catch (e) {
      return "";
    }
  }).filter(ele => typeof ele === "object");
}

function getHeaders(data) {
  let headers = [];
}
