sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";
	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			// create
			var oMockServer = new MockServer({
				rootUri: "/"
			});
			// simulate against the metadata and mock data
			oMockServer.simulate("../localService/metadata.xml", {
				sMockdataBaseUrl: "../localService/mockdata",
				bGenerateMissingMockData: true
			});

			/**
			 * We push a new request handler to mock the function import call as follows:
				1. Fetch the array of requests from the MockServer. 
				 The mock server holds an internal list of requests that you have to get and set if you want to modify.
				2. Push a new request handler to handle the function import
				3. Set the updated request array
			 * 
			 */
			var aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("FindUpcomingMeetups(.*)"),
				response: function(oXhr, sUrlParams) {
					jQuery.sap.log.debug("Incoming request for FindUpcomingMeetups");
					var today = new Date(2016, 9, 30);
					today.setHours(0); // or today.toUTCString(0) due to timezone differences
					today.setMinutes(0);
					today.setSeconds(0);
					//console.log(today.getTime());
					var oResponse = jQuery.sap.sjax({
						url: "/Meetups?$filter=EventDate ge " + "/Date(" + today.getTime() + ")/"
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
					return true;
				}
			});
			oMockServer.setRequests(aRequests);

			var fnCustom = function(oEvent) {
				var oXhr = oEvent.getParameter("oXhr");
				if (oXhr && oXhr.url.indexOf("first") > -1) {
					oEvent.getParameter("oFilteredData").results.splice(3, 100);
				}
			};
			oMockServer.attachAfter("GET", fnCustom, "Meetups");

			// start
			oMockServer.start();
			jQuery.sap.log.info("Running the app with mock data");
		}
	};
});