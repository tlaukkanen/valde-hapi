/**
 * Created by Ali on 3/13/2015.
 */

"use strict";

var path = require("path"),
    db_mgr = require("valde-hapi").database,
    app_config = require("valde-hapi").app_config;

function handler(request, reply) {

    if (!(request.__valde.web_model)) {
        request.__valde.web_model = {};
    }

    if (request.auth.isAuthenticated) {
        //add the user account data to the model
        var collectionName = "sa_customer_accounts";

        db_mgr.find(
                collectionName, {
                    "_id": request.auth.credentials.account_id
                })
            .then(
                (accountData) => {
                    request.__valde.web_model.account_type = request.auth.credentials.account_type;
                    request.__valde.web_model.account_data = accountData;
                },
                function (err) {})
            .catch(function (err) {})
            .finally(function () {
                reply.view(request.__valde.web_model.pageViewTemplate, request.__valde.web_model);
            });
    } else {
        reply.view(request.__valde.web_model.pageViewTemplate, request.__valde.web_model);
    }
}

module.exports = {
    method: "GET",
    path: app_config.get("app_root") + "/{pageID*}",
    config: {
        handler: handler,
        auth: {
            mode: "try",
            strategy: "session"
        },
        plugins: {
            "hapi-auth-cookie": {
                redirectTo: false
            },
            "resource_set": {
                enabled: true
            },
            "web_model": {
                enabled: true
            }
        }
    }
};
