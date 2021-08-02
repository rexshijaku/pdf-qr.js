var decodeType = 'allpages';
var configs = {
    scale: {
        once: true,
        value: 1,

        start: 0.2,
        step: 0.2,
        stop: 2
    },
    resultOpts: {
        singleCodeInPage: true,
        multiCodesInPage: false,
        maxCodesInPage: 1
    },
    improve: true,
    jsQR: {}
};

function onceHandler(once) {

    var rangeHolder = document.getElementById('range-holder');
    var staticHolder = document.getElementById('static-holder');
    if (once) {
        rangeHolder.style.display = 'none';
        staticHolder.style.display = 'inline';
    }
    else {
        rangeHolder.style.display = 'inline';
        staticHolder.style.display = 'none';
    }
    configs.scale.once = once;
    writeConfigs();
}

function singleMultiHandler(isMulti) {
    var maxPerPage = document.getElementById('maxPerPage');
    var multi = parseInt(isMulti) === 1;
    if (multi) {
        maxPerPage.value = 1;
        maxPerPage.disabled = false;

    }
    else {
        maxPerPage.value = 1;
        maxPerPage.disabled = true;
    }

    configs.resultOpts.multiCodesInPage = multi;
    configs.resultOpts.singleCodeInPage = !multi;
    configs.resultOpts.maxCodesInPage = 1;
    writeConfigs();
}

function handleLocate(locate) {
    configs.quagga.locate = locate;
    writeConfigs();
}

function handleValueChange(value) {
    configs.scale.value = parseFloat(value);
    writeConfigs();
}

function handleStartChange(value) {
    configs.scale.start = parseFloat(value);
    writeConfigs();
}

function handleStepChange(value) {
    configs.scale.step = parseFloat(value);
    writeConfigs();
}

function handleStopChange(value) {
    configs.scale.stop = parseFloat(value);
    writeConfigs();
}

function handleMaxCodesChange(value) {
    configs.resultOpts.maxCodesInPage = parseFloat(value);
    writeConfigs();
}

function handleSmartChange(value) {
    configs.improve = value;
    writeConfigs();
}

function qrJsInvertHandler(val) {
    if (val === 'default')
        configs.jsQR = {};
    else
        configs.jsQR.inversionAttempts = val;
    writeConfigs();
}


window.onload = function (e) {

    writeConfigs();

    var copyTextinputBtn = document.querySelector('.js-textinputcopybtn');
    copyTextinputBtn.addEventListener('click', function(event) {

        var copyTextinput = document.getElementById('configs');
        copyTextinput.innerHTML = JSON.stringify(configs, undefined, 4);
        copyTextinput.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text input command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    });
};

function writeConfigs() {
    var copyTextinput = document.getElementById('configs');
    copyTextinput.innerHTML = JSON.stringify(configs, undefined, 4);

    var confstr = JSON.stringify(configs);
    console.log(confstr);
}

function addrow(text) {
    var tableRef = document.getElementById('summary').getElementsByTagName('tbody')[0];
    var newRow   = tableRef.insertRow();
    var newCell  = newRow.insertCell(0);
    var newText  = document.createTextNode(text);
    newCell.appendChild(newText);
}

function handleDecodeType(val) {

    console.log(val);
    var pageNrInput = document.getElementById('pageNr');
    if(parseInt(val) === 1)
    {
        pageNrInput.style.display = 'none';
        decodeType = 'allpages';
    }
    else
    {
        pageNrInput.style.display = '';
        decodeType = 'singlepage';
    }
}