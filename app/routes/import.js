var ContributionsDAO = require("../data/contributions-dao").ContributionsDAO;
var libxmljs = require('libxmljs');

/* The ImportContributionsHandler must be constructed with a connected db */
function ImportContributionsHandler(db) {
    "use strict";

    var contributionsDAO = new ContributionsDAO(db);

    this.displayImportContributons = function(req, res, next) {
        var userId = req.session.userId;

        contributionsDAO.getByUserId(userId, function(error, contrib) {
            if (error) return next(error);

            contrib.userId = userId; //set for nav menu items
            return res.render("import", contrib);
        });
    };

    this.handleImportContributonsUpdate = function(req, res, next) {

        var preTax, afterTax, roth
        var userId = req.session.userId;

		if (req.file && req.file.mimetype == 'text/xml') {
			var xml = libxmljs.parseXmlString(req.file.buffer.toString('utf-8'), {noent:true, noblanks: true})

			preTax = parseInt(xml.get('/contributions/pretax').text())
			afterTax = parseInt(xml.get('/contributions/aftertax').text())
			roth = parseInt(xml.get('/contributions/roth').text())

			//validate contributions
			if (isNaN(preTax) || isNaN(afterTax) || isNaN(roth) || preTax < 0 || afterTax < 0 || roth < 0) {
				return res.render("import", {
					updateError: "Invalid contribution percentages in XML: " + xml,
					userId: userId
				});
			}
		} else {
            return res.render("import", {
                updateError: "XML file required for processing",
                userId: userId
            });
		}

        // Prevent more than 30% contributions
        if (preTax + afterTax + roth > 30) {
            return res.render("import", {
                updateError: "Contribution percentages cannot exceed 30 %",
                userId: userId
            });
        }

        contributionsDAO.update(userId, preTax, afterTax, roth, function(err, contributions) {

            if (err) return next(err);

            contributions.updateSuccess = true;
            return res.render("import", contributions);
        });

    };

}

module.exports = ImportContributionsHandler;
