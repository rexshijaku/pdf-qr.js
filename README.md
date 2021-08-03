# PDF-QR.js
PDF QR Code scanner entirely written in JavaScript.

### Features
Full-document scan <br />
Single page scan

### Demo

##### Online demo
Live demo will be available <a href="https://github.com/rexshijaku/pdf-qr.js" target="_blank">here</a>.

##### Web server
Clone or download this repository and run demo/ws_demo.html. This demo uses two files: (1) dist/pdf-qr.js and (2) worker file pdf.worker.min.js. Note that the pdf.worker.min.js should be placed in the projects output folder. You must run this ws_demo.html using a web server in order to take the advantage of http:// or https:// protocols to load workers, otherwise using file:// won't load the essential worker. If you don't have any web server installed, you may take a look at the alternative demo version.

##### Alternative
After you clone this repository, on your local machine run (open on a browser) demo/file_demo.html. This example uses minified versions of dependent libraries and its files. This offers you a version which can be tested with zero configurations compared to the previous one.

### Get Started
##### Install by manual download:
Download pdf-qr.js which is located in dist folder and load it as follows :
```html
 <script type="text/javascript" src="pdf-qr.js"> </script>
```
**Important** : Make sure that the **pdf.worker.min.js** file is copied to your project's output folder.
Note that if you don't want to take care of pdf.worker.min.js separately as it was explained, follow the alternative install by manual download.

##### Alternative install by manual download:
Download minified files located in demo/js/file_demo_only and include them just in your assets directory which is targeted by your scripts as it was described in file_demo.html.

##### NPM
You can also install it from npm by running the following command:
```html
npm install pdf-qr
```
include it as:
```js
import { PDF_QR_JS }  from 'pdf-qr';  // ES6

const { PDF_QR_JS } = require('pdf-qr'); // Common JS
```

##### Webpack and other building tools
If you use Webpack or other bundling tools, you will have to make sure on your own that pdf.worker.min.js file from pdfjs-dist/build is copied to your project's output folder.

Alternatively, you can use pdf.worker.min.js from an external CDN:
##
```javascript
import { PDF_JS } from 'pdf-qr';
PDF_JS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS.version}/pdf.worker.min.js`;
```
### Usage

#### Set up the optimal configuration
The efficiency and the accuracy of this library totally depends on the given configuration. By default it uses a configuration which worked best during development and testing. You should modify and optimize this configuration to fit to your QR Code sizes. Use any of provided demos above to construct configuration parameters or write them manually. There are four steps you need to undertake to decode a pdf:
##### JavaScript code:
### 
```js

var configs = { // create and populate configs variable
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
```
```js
 // select the input file
 var input_file = document.getElementById('pdfentryfile');

 // create callback which handles the result 
 var callback =  function(result) {
    if(result.success)
        console.log(result.codes)
    else 
        console.log(result.message);
 }
```


##### Full-Document decode:
##
```js
 //decode document (all pages)
 PDF_QR_JS.decodeDocument(input_file, configs, callback);
```

##### Single page decode:
##
```js
 // or decode a single page
 var pageNr = 1;
 PDF_QR_JS.decodeSinglePage(input_file, pageNr, configs, callback);
```

##### Html code:
##
```html
 <input id="pdfentryfile" type="file" accept="application/pdf">
```
#### Node usage
Currently, the full functionality is only available through the browser. Only the pdf-file-based decoding is available. See an example for node <a href="https://github.com/rexshijaku/pdf-qr.js/blob/master/demo/node_demo/">here</a>.

### How does it works?
PDF-QR.js combines and extends the functionality of <a href="https://github.com/mozilla/pdf.js/">pdf.js</a> and <a href="https://github.com/cozmo/jsQR">jsQR</a> to introduce a tool which is able scan QR Codes which are placed on PDFs. It fetches and reads pages via <a href="https://github.com/mozilla/pdf.js/">pdf.js</a> methods subsequently adds few processing steps and lastly passes them to <a href="https://github.com/cozmo/jsQR">jsQR</a> which decodes the codes which are present in pages.
This library supports all QR Code versions which are supported by <a href="https://github.com/cozmo/jsQR">jsQR</a>.
Depending on the number of pages you want to decode and the QR Code sizes you have in your PDFs, you should find the optimal configuration for your PDF decoder which can be done using one of the demo version offered in this repo. After you find the neccessary configuration, just copy it and you are ready to paste it in your code and to start decode QR Codes in PDFs.

#### Config arguments

##### scale
This parameter specifies how much a page should be enlarged (scaled) before it reaches to the decoder. If it is given as *once* then it scales pages one time by the given value, otherwise if you specify start, step and stop parameters, page will be scaled iteratively until requested QR Codes are found, if decoder can't find any QR Code this process will continue until the maximum number of steps is reached. If you have different QR Code sizes throughout the pages you should use the latter way, if your QR Codes have a fixed size the former way is ideal. Note that this is an important parameter for the performance of the decoder, fewer steps will offer higher performance.

##### resultOpts
Depending on how many QR Codes you need to extract from a page, 
you should specify this parameter. 
If you need just one QR Code per page then turn singleCodeInPage on. Currently, scanning multiple codes in a page (multiCodesInPage) is not supported.

##### improve
PDF-QR.js improves itself continuously with an intention to minimize resources in following pages. When it finds a QR Code in a page, it will use that configuration on the next page as a first step.

#### jsQR options
You may specify jsQR options (such as inversionAttempts) directly.
In order to get a more insightful knowledge on how jsQR options work, please check its repository <a href="https://github.com/cozmo/jsQR">here</a>.

#### result object
The most important property of result object is *codes* property which stores all codes found in a document or requested page. Alongside this field are grouped *codes by pages*, *codes by QR Code versions* and *statistics*. In development, these stats should be analyzed in order to conclude which parameters should be to excluded, included or adjusted more accurately, in order to reach a satisfying performance and accuracy.
##
```js
{
    "codes": [
        "code_1",
        "code_2"
    ],
        "codesByPage": [
        1: ["code_1"],
        2: ["code_2"]
],
    "codesByPageAndVersion": [
        1: {
        "6": ["code_1"]
    },
    2: {
        "7": ["code_2"]
    }
],
    "codesByVersion": [
        "6": [
        "code_1"
    ],
        "7": [
        "code_2"
    ]
],
    "codesDetailed": [{
        "code": "code_1",
        "version": "6",
        "page": 1,
        "scale": 1
    },
        {
            "code": "code_2",
            "version": "7",
            "page": 2,
            "scale": 1
        }
    ],
        "stats": {
        "totalOnScale": [
            3: 2
    ]
    },
    "statsByPage": [
        1: {
        "totalOnScale": [
            3: 1
    ]
    },
    2: {
        "totalOnScale": [
            3: 1
    ]
    }
],
    "success": true
}
```

### Contributions
Feel free to contribute on development, testing or eventual bug reporting. I am personally not so much involved in front-end development, and I think that this project
needs a better file organization, especially for making it more easy for others to use and contribute. I would also like to encourage someone to write tests, we hopefully may use <a href="https://github.com/cozmo/jsQR/tree/master/tests/end-to-end">this</a> folder to convert files in it to PDFs.

### Testimonial
This project is a Sister Project of <a href="https://github.com/rexshijaku/PDFBarcodeJS">PDFBarcodeJS</a>, and was initiated after <a href="https://github.com/rexshijaku/PDFBarcodeJS/issues/3">this</a> request.

### Support
For general questions about PDF-QR.js, tweet at @rexshijaku or write me an email on rexhepshijaku@gmail.com.
To have a quick tutorial check the examples folder provided in the repository.

### Author
##### Rexhep Shijaku
- Email : rexhepshijaku@gmail.com
- Twitter : https://twitter.com/rexshijaku

### Thank you
Mozilla as the author of the <a href="https://github.com/mozilla/pdf.js/">pdf.js</a>, Cosmo Wolfe <a href="mailto:cosmo.wolfe@gmail.com">cosmo.wolfe@gmail.com</a> for initiating <a href="https://github.com/cozmo/jsQR">jsQR</a> alongside with other contributors who are continually improving it.

### License
MIT License

Copyright (c) 2021 | Rexhep Shijaku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
