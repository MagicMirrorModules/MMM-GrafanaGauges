Module.register("MMM-GrafanaGauges", {
    // Default module config.
    defaults: {
        height: "100",
        width: "100",
        refreshInterval: 900,
        animationSpeed: 1000,
        https: false,
        version: 0
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name + "!!!!");
        this.scheduleUpdate(this.config.refreshInterval);
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
        if (!this.config.host) {
            Log.error("MMM-GrafanaGauges: config.host is required");
            return wrapper;
        }

        var protocol = this.config.https === true ? "https://" : "http://";
        var version = parseInt(this.config.version, 10) || 0;
        var baseUrl;

        if (version >= 6) {
            if (!this.config.id) {
                Log.error("MMM-GrafanaGauges: config.id is required for Grafana 6+");
                return wrapper;
            }
            baseUrl = protocol + this.config.host + ":" + this.config.port + "/d-solo/" + this.config.id + "/" + this.config.dashboardname + "?orgId=" + this.config.orgId + "&fullscreen&kiosk";
        } else {
            baseUrl = protocol + this.config.host + ":" + this.config.port + "/dashboard-solo/db/" + this.config.dashboardname + "?orgId=" + this.config.orgId;
        }

        var img = '';
        if (Array.isArray(this.config.showIDs) && this.config.showIDs.length > 0) {
            for (var i = 0; i < this.config.showIDs.length; i++) {
                img += '<iframe src="' + baseUrl + '&panelId=' + this.config.showIDs[i] + '" width="' + this.config.width + '" height="' + this.config.height + '" frameborder="0" scrolling="no"></iframe>';
            }
        } else {
            Log.warn("MMM-GrafanaGauges: config.showIDs is empty or missing");
        }

        wrapper.innerHTML = img;
        wrapper.setAttribute("timestamp", new Date().getTime());
        return wrapper;
    },

    scheduleUpdate: function(delay) {
        var nextLoad = this.config.refreshInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay * 1000; // Convert seconds to millis
        }
        var self = this;
        setTimeout(function() {
            self.updateFrame();
        }, nextLoad);
    },

    updateFrame: function() {
        if (!this.config.host) {
            Log.error("Tried to refresh, iFrameReload URL not set!");
            return;
        }

        this.updateDom(this.config.animationSpeed);
        this.scheduleUpdate(this.config.refreshInterval);
    }
});
