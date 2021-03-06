/**
 * Created by aismael on 3/12/2015.
 */

"use strict";

const app_config = require("../../app_config").get_config(),
    dustArtifactCache = require("./dust_artifact_cache"),
    dust = require("dustjs-linkedin");

// Load helpers
dust.helpers = require("dustjs-helpers").helpers;

// load APP helpers:
//require("../app_helpers");

dust.optimizers.format = function(ctx, node) {
    return node;
};

/**
 *
 * @param name
 * @param next
 */
dust.onLoad = (name, next) => {
    dustArtifactCache.get(name, (err, dustArtifact) => {
        if (err) {
            next(err, "");
        } else {
            dust.loadSource(dustArtifact.compiledSource);
            next(undefined, "");
        }
    });
};

//let appRoot = path.resolve(".");
const logger_factory = require("../../app_logger");
const logger = logger_factory.getLogger("DustViewEngine", (app_config.get("env:production") || app_config.get("env:sandbox"))
    ? "WARN"
    : "DEBUG");

/**
 *
 * @param template
 * @param compileOpts
 * @param next
 * @returns {*}
 */
const compile = (template, compileOpts, next) => {

    return next(null, function render(context, renderOpts, callback) {
        /**
         * In dev mode, the view caches will be flushed per invocation to
         * force re-compilation of relevant artifacts:
         */
        if ((app_config.get("env:development") && (!app_config.get("liveEmulation")))) {
            dustArtifactCache.clear();
        }

        dustArtifactCache.get(context.pageViewID, (err, dustArtifact) => {
            if (err) {
                if (err) {
                    logger.error(err.stack);
                    callback(err, "");
                }
            } else {
                dust.render(dustArtifact.partialID, context, (err, htmlOut) => {
                    if (err) {
                        logger.error(err.stack);
                    }

                    try {
                        callback(err, htmlOut);
                    } catch (err) {
                        logger.error(err.stack);
                    }
                });
            }

        });
    });

};

/**
 *
 * @param name
 * @param data
 */
const registerPartial = (name, data) => {
    //dust.compileFn(data, name)
};

/**
 *
 */
const registerHelper = (name, helper) => {
    //if (helper.length > 1)
    //    dust.helpers[name] = helper
    //else
    //    dust.filters[name] = helper
};

/**
 *
 * @param config
 * @param next
 */
const prepare = (config, next) => {
    next();
};

/**
 *
 */
module.exports = {
    compile,
    prepare,
    registerPartial,
    registerHelper
};
