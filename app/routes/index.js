var SessionHandler = require("./session");
var ProfileHandler = require("./profile");
var BenefitsHandler = require("./benefits");
var ImportContributionsHandler = require("./import");
var ContributionsHandler = require("./contributions");
var AllocationsHandler = require("./allocations");

var ErrorHandler = require("./error").errorHandler;

var multer = require('multer')
var upload = multer()

var exports = function(app, db) {

    "use strict";

    var sessionHandler = new SessionHandler(db);
    var profileHandler = new ProfileHandler(db);
    var benefitsHandler = new BenefitsHandler(db);
    var contributionsHandler = new ContributionsHandler(db);
	var importContributionsHandler = new ImportContributionsHandler(db);
    var allocationsHandler = new AllocationsHandler(db);

    // Middleware to check if a user is logged in
    var isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    var isAdmin = sessionHandler.isAdminUserMiddleware;

    // Middleware for custom cookie handling
    var cookieHandler = sessionHandler.cookieHandlerMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, cookieHandler, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, cookieHandler, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, cookieHandler, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, cookieHandler, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, cookieHandler, contributionsHandler.handleContributionsUpdate);

    // Import Contributions Page
    app.get("/import", isLoggedIn, cookieHandler, importContributionsHandler.displayImportContributons);
    app.post("/import", isLoggedIn, cookieHandler, upload.single('importxml'), importContributionsHandler.handleImportContributonsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, cookieHandler, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, cookieHandler, benefitsHandler.updateBenefits);
    /* Fix for A7 - checks user role to implement  Function Level Access Control
     app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
     app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);
     */

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, cookieHandler, allocationsHandler.displayAllocations);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, cookieHandler, function(req, res, next) {
        // Insecure way to handle redirects by taking redirect url from query string
        return res.redirect(req.query.url);
    });

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = exports;
