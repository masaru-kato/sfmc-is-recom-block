'use strict'

let sdk = new window.sfdc.BlockSDK(); //initalize SDK
//let defaultContent = `<h1>This is the defualt content</h1>`

var action, pid;

const act = "SET YOUR ACCOUNT";
const dst = "SET YOUR DATASET";

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function createSettings() {
    document.getElementById('action').value = action || "ACTION";
    document.getElementById('pid').value = pid || "ContactKey";
}


function createblock() {
    action = document.getElementById('action').value;
    pid = document.getElementById('pid').value;

    if (!action || !pid) {
        return;
    }

    // build content string 
    var url = ""
    url = "";
    url += '%%[\n';
    url += '  set @uid = ' + pid + '  \n';
    url += '  set @actionname = "' + action + '"  \n';
    url += '  IF Empty(@actionname) THEN\n';
    url += '    RaiseError("Not found ACTIONNAME.")\n';
    url += '  ENDIF\n';
    url += ']%%\n';
    url += '<script runat="server">\n';
    url += 'Platform.Load("core", "1");\n';
    url += 'var uid = Variable.GetValue("uid");\n';
    url += 'var action = Variable.GetValue("actionname");\n';
    url += 'var url = "https://' + act + '.australia-3.evergage.com/api2/event/' + dst + '";\n';
    url += 'var postdata= {\n';
    url += ' "action": action,\n';
    url += ' "user": {\n';
    url += '  "id": uid,\n';
    url += '        "attributes":{\n';
    url += '            "sfmcContactKey" : uid\n';
    url += '        }\n';
    url += ' }\n';
    url += '};\n';
    url += 'var req = new Script.Util.HttpRequest(url);\n';
    url += 'req.contentType = "application/json";\n';
    url += 'req.method = "POST";\n';
    url += 'req.postData = Platform.Function.Stringify(postdata);\n';
    url += '// Send request\n';
    url += 'var resp = req.send();\n';
    url += 'var resEval = Platform.Function.ParseJSON(String(resp.content));  \n';
    url += '//Write(Platform.Function.ParseJSON(resEval));\n';
    url += 'var pUrl1, pName1, pImage1, pDesc1\n';
    url += 'var trendProducts = resEval.campaignResponses[0].payload.trendProducts;\n';
    url += 'if(trendProducts.length > 0){\n';
    url += '   pUrl1 = trendProducts[0].attributes.url.value;\n';
    url += '   pName1 = trendProducts[0].attributes.name.value;\n';
    url += '   pImage1 = trendProducts[0].attributes.imageUrl.value;\n';
    url += '   pDesc1 = trendProducts[0].attributes.description.value;\n';
    url += '}  \n';
    url += 'Variable.SetValue("recitem1url", pUrl1);\n';
    url += 'Variable.SetValue("recitem1name", pName1);\n';
    url += 'Variable.SetValue("recitem1imageUrl", pImage1);\n';
    url += 'Variable.SetValue("recitem1description", pDesc1);  \n';
    url += '</script>\n';

    sdk.setContent(url);
    sdk.setData({
        action: action,
        pid: pid
    });

}

sdk.getData(function (data) {
    action = data.action;
    pid = data.pid;
    createSettings();

    createblock();
});

document.getElementById('action').addEventListener("change", function () {
    debounce(createblock, 500)();
});

document.getElementById('pid').addEventListener("change", function () {
    debounce(createblock, 500)();
});

//sdk.setSuperContent(defaultContent, (newSuperContent) => { });

// Event Handlers
//window.onload = fetchData;
//window.onchange = saveData;