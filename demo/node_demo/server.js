const {PDF_QR_JS} = require('pdf-qr');
var configs = {
    scale: {
        once: true,
        value: 1
    },
    resultOpts: {
        singleCodeInPage: true
    },
    improve: true,
    jsQR: {}
};

const file_path = new URL(`file:///${__dirname + "/example.pdf"}`).href;

var callback = function (result) {
    if (result.success)
        console.log(result.codes)
    else
        console.log(result.message);
}

PDF_QR_JS.decodeSinglePage(file_path, 1, configs, callback);