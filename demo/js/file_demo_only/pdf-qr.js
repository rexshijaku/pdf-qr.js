var PDF_JS = pdfjsLib;
var QR_JS = jsQR;


var PDF_QR_JS = (function () {
    var env = 'PROD';


    function init(conf) {

        var configs = extend({}, {
            scale: {
                once: true,
                value: 1,

                start: 0.2,
                step: 0.2,
                stop: 2
            },
            resultOpts: {
                singleCodeInPage: false,
                multiCodesInPage: true,
                maxCodesInPage: 1
            },
            improve: true,
            jsQR: {}
        });

        configs = merge(configs, conf);
        arrangeConfigs(configs);
        return configs;
    }

    function extend(settings, options) {
        for (var key in options)
            if (options.hasOwnProperty(key))
                settings[key] = options[key];
        return settings;
    }

    function merge(obj1, obj2) {
        for (var p in obj2) {
            try {
                if (obj2[p].constructor == Object) {
                    obj1[p] = merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }

    function arrangeConfigs(settings) {

        if (!settings.resultOpts.multiCodesInPage || settings.resultOpts.singleCodeInPage) {
            settings.resultOpts.maxCodesInPage = 1; // then it should be single
            // settings.jsqr.decoder.multiple = false;
            // todo future jsqr multiple turn to false
        } else {
            // todo future jsqr multiple turn to trie
            // settings.jsqr.decoder.multiple = true; // if not single then set multi so jsQR can decode multiple at one time
        }

        if (settings.scale.once) {
            var val = parseFloat(settings.scale.value.toFixed(2));
            settings.scale.start = val;
            settings.scale.stop = val;
            settings.scale.step = 1.0;
            settings.scale.ordered = [val];
        } else {
            settings.scale.ordered = [];
            var i = settings.scale.start;
            for (i = settings.scale.start; i <= settings.scale.stop; i += settings.scale.step) {
                i = parseFloat(i.toFixed(2));
                settings.scale.ordered.push(i);
            }
        }
    }

    function getCanvas(viewport) {

        var canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        return canvas;
    }

    function getPageAsImg(canvas, scaled) {

        var result = {};

        var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

        if (scaled === 1) {
            var imgToBePrinted = document.createElement('canvas');
            imgToBePrinted.width = canvas.width;
            imgToBePrinted.height = canvas.height;
            imgToBePrinted.getContext('2d').putImageData(imageData, 0, 0);
            result.printImg = imgToBePrinted;
        }

        var imgToProcess = document.createElement('canvas');
        imgToProcess.width = canvas.width;
        imgToProcess.height = canvas.height;

        result.processImg = imageData.data;
        result.imgWidth = canvas.width;
        result.imgHeight = canvas.height;
        return result;
    }

    function setResult(result, document_codes, currentPage, scaled, settings) {

        if (settings.resultOpts.singleCodeInPage) { // when single result  jsQR returns obj only

            if (result) {
                if (env === 'DEV')
                    console.log("PAGE_" + currentPage + " has results when scaled " + scaled + " times.");
                addResult(result, document_codes, currentPage, scaled);
            } else {
                if (env === 'DEV')
                    console.log("PAGE_" + currentPage + " when scaled " + scaled + " times.");
            }
        } else  // when multi result obj of jsQR returns array
        {
            var hasResult = false;
            result = [result]; // temp todo
            if (result) {

                for (var i = 0; i < result.length; i++) {
                    if (result[i]) {

                        if (env === 'DEV' && !hasResult) {
                            hasResult = true;
                            console.log("PAGE_" + currentPage + " when scaled " + scaled + "  times has no results.");
                        }

                        var codeResult = result[i];
                        var pageFormatCollector = document_codes.codesByPageAndVersion[currentPage][codeResult.version];
                        if (pageFormatCollector !== undefined
                            && pageFormatCollector.indexOf(codeResult.data) !== -1)
                            continue;

                        if (document_codes.codesByPage[currentPage].length === settings.resultOpts.maxCodesInPage) // page limit reached
                            break;

                        addResult(codeResult, document_codes, currentPage, scaled);
                    }
                }
            }

            if (!hasResult) {
                if (env === 'DEV')
                    console.log("PAGE_" + currentPage + " when scaled " + scaled + " times has no results.");
            }
        }
    }

    function addResult(codeResult, resultObj, page, scale) {

        if (env === 'DEV')
            console.log("Adding " + codeResult.data);

        resultObj.codes.push(codeResult.data);
        resultObj.codesDetailed.push({code: codeResult.data, version: codeResult.version, page: page, scale: scale});
        resultObj.codesByPage[page].push(codeResult.data);

        if (resultObj.codesByPageAndVersion[page][codeResult.version] === undefined) // this array helps to prevent same qr codes in a page with same version to be collected
            resultObj.codesByPageAndVersion[page][codeResult.version] = [codeResult.data];
        else
            resultObj.codesByPageAndVersion[page][codeResult.version].push(codeResult.data);

        if (resultObj.codesByVersion[codeResult.version] === undefined) // this arr
            resultObj.codesByVersion[codeResult.version] = [codeResult.data];
        else
            resultObj.codesByVersion[codeResult.version].push(codeResult.data);

        resultObj.statsByPage[page].totalOnScale[scale] += 1;
        resultObj.stats.totalOnScale[scale] += 1;
    }

    function shuffle2Optimize(arr, first, type) {

        if (env === 'DEV') {
            console.log(type + " order before smart shuffle");
            console.log(arr);
            console.log('Applying smart shuffle...');
        }

        var position = arr.indexOf(first);
        if (position === -1)
            return arr;

        var ordered = [];
        var myarrlen = arr.length;
        var left = position;
        var right = position;

        ordered.push(first);
        while (ordered.length !== myarrlen) {
            left--;
            right++;
            if (left >= 0)
                ordered.push(arr[left]);
            if (right < myarrlen)
                ordered.push(arr[right]);
        }

        if (env === 'DEV') {
            console.log(type + " order after shuffle...");
            console.log(ordered);
        }

        return ordered;
    }

    function copyobj(source, deep) {
        var o, prop, type;
        if (typeof source != 'object' || source === null) {
            o = source;
            return o;
        }
        o = new source.constructor();
        for (prop in source) {

            if (source.hasOwnProperty(prop)) {
                type = typeof source[prop];

                if (deep && type == 'object' && source[prop] !== null) {
                    o[prop] = this.copyobj(source[prop]);

                } else {
                    o[prop] = source[prop];
                }
            }
        }
        return o;
    }

    // initiates the structure of the object which will collect results
    function initResult(currentPage, settings, result) {

        result.codesByPage[currentPage] = [];
        result.codesByPageAndVersion[currentPage] = [];

        result.statsByPage[currentPage] = {totalOnScale: []};

        var scale_len = settings.scale.ordered.length;
        for (var j = 0; j < scale_len; j++) {
            result.statsByPage[currentPage].totalOnScale[settings.scale.ordered[j]] = 0;
            if (!result.stats.totalOnScale.hasOwnProperty(settings.scale.ordered[j]))
                result.stats.totalOnScale[settings.scale.ordered[j]] = 0;
        }
    }

    function parseResult(result, params) {

        result.success = true;
        if (params.singlePage) {
            delete result.codesByPage;
            delete result.statsByPage;
            delete result.codesByPageAndVersion;
            result.decodedPage = params.pageNr;
        }
        return result;
    }

    function pageInRange(pdf, pageNr) {
        return pageNr >= 1 && pageNr <= pdf.numPages;
    }

    function decodeDocument(input, configs, final_call_back, page_printer) {

        decoder({
            input: input,
            singlePage: false,
            configs: configs,
            final_call_back: final_call_back,
            page_printer: page_printer
        });
    }

    function decodeSinglePage(input, pageNr, configs, final_call_back, page_printer) {

        decoder({
            input: input,
            singlePage: true,
            pageNr: pageNr,
            configs: configs,
            final_call_back: final_call_back,
            page_printer: page_printer
        });
    }

    function decoder(params) {

        var finalResults = {
            codes: [],
            codesDetailed: [],
            codesByPage: [],
            codesByVersion: [],
            codesByPageAndVersion: [],
            stats: {totalOnScale: []},
            statsByPage: [],
            success: false
        };

        var settings = init(params.configs);
        if (env === 'DEV') {
            console.log("Initial settings...");
            console.log(settings);
        }

        var currentPage = 1;
        var jsQR_configs = copyobj(settings.jsQR);


        var url = '';
        if (typeof params.input === 'object' && params.input !== null && params.input.files !== undefined) // for uploaded files only
            url = URL.createObjectURL(params.input.files[0]);
        else
            url = params.input; // for base64 strings only

        PDF_JS.getDocument(url).promise.then(function (pdf) {

            if (params.singlePage) {
                if (!pageInRange(pdf, params.pageNr)) {
                    params.final_call_back({
                        success: false,
                        message: "Given page is out of range! Valid page range is (1-" + pdf.numPages + ")"
                    });   // PDF loading error
                    return false;
                } else
                    currentPage = params.pageNr;
            }

            getPage();

            function getPage() {
                if (env === 'DEV')
                    console.log("PAGE_" + currentPage + " fetched...");
                pdf.getPage(currentPage).then(async function (page) {

                    if (env === 'DEV')
                        console.log("PAGE_" + currentPage + " rendered...");

                    initResult(currentPage, settings, finalResults);

                    var postPdfJsPageRender = function (canvas, scaled, scalingTime) {

                        return new Promise(resolve => {

                                var imginfo = getPageAsImg(canvas, scalingTime);

                                if (params.page_printer !== undefined && scalingTime === 1)
                                    params.page_printer(imginfo.printImg, currentPage, scaled);  //info only

                                const code = QR_JS(imginfo.processImg, imginfo.imgWidth, imginfo.imgHeight, jsQR_configs);
                                if (code) {
                                    setResult(code, finalResults, currentPage, scaled, settings);
                                    return resolve({isDone: true, message: "Ok found!"});
                                } else
                                    return resolve({isDone: false, message: "Not found!"});
                            }
                        );
                    };

                    // scale pages (as images) in given range
                    var scale_len = settings.scale.ordered.length;
                    for (var i = 0; i < scale_len; i++) {
                        const scaled = settings.scale.ordered[i];
                        const viewport = page.getViewport({scale: scaled});
                        const canvas = getCanvas(viewport);
                        const scalingTime = i + 1;

                        if (env === 'DEV')
                            console.log("PAGE_" + currentPage + " scaling " + scaled + " times.");

                        var result = await page.render({
                            canvasContext: canvas.getContext('2d'),
                            viewport: viewport
                        }).promise.then(() => postPdfJsPageRender(canvas, scaled, scalingTime));

                        if (result.isDone) {
                            if (env === 'DEV')
                                console.log("PAGE_ " + currentPage + " was finished! Stopping the loop of scale! (on scale " + scaled + ")");

                            if (settings.improve) // for the next page it will start with this scale
                            {
                                settings.scale.ordered = shuffle2Optimize(settings.scale.ordered, scaled, 'Scale');
                            }
                            break;
                        } else {
                            if (env === 'DEV')
                                console.log(result);
                        }
                    }

                    if (!params.singlePage && currentPage < pdf.numPages) {
                        currentPage++;
                        getPage();
                    } else
                        params.final_call_back(parseResult(finalResults, params));
                });
            }
        }, function (reason) {
            params.final_call_back({success: false, message: reason.message});   // PDF loading error
        });
    }

    return { // "export"
        decodeDocument: decodeDocument,
        decodeSinglePage: decodeSinglePage
    };
})();