const headers = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Content-Type': 'application/json'
};

exports.handler = async (event, context, callback) => {
    
    if (event.httpMethod === 'OPTIONS') { // The browser is checking the function to see the headers (called 'preflight' I think)
        callback(null, {statusCode: 204,headers});
    }
    if (event.httpMethod !== 'POST') {
        callback({statusCode: 405,headers}, null);
    }
    /*if(event.headers['X-Requested-With'] !== 'XMLHttpRequest') {
        // Without the `X-Requested-With` header, this request could be forged. Aborts.
        callback({statusCode: 403,headers}, null);
    }*/
    
    // INPUTS
    const code = JSON.parse(event.body).code;
    // END INPUTS
    
    const rp = require('request-promise');

    return rp.post({
        method: 'POST',
        uri: 'https://api.getmakerlog.com/oauth/token/',
        formData: {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env['MAKERLOG_CLIENT_ID'],
            client_secret: process.env['MAKERLOG_CLIENT_SECRET'],
            redirect_uri: process.env['MAKERLOG_REDIRECT_URI']
        }
    }).then(function (body) {
        body = JSON.parse(body);
        callback(null, {statusCode: 200, headers:headers, body: JSON.stringify({
            refresh_token: body.refresh_token,
            access_token: body.access_token
        })});
    }).catch(function (err) {
        console.log(err.response.body);
        callback({statusCode: 403, headers:headers, body: err.response.body}, null)
    });
}