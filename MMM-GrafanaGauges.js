Module.register("MMM-GrafanaGauges", {
    // Default module config.
    defaults: {
        height:"100",
        width:"100",
        refreshInterval: 900,
        animationSpeed: 1000,
        ssl: false
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name + "!!!!");
        this.scheduleUpdate(this.config.refreshInterval);
    },
    // Override dom generator.
    getDom: function() {
            var img = '';
            var wrapper = document.createElement("div");
            var url =  ((this.config.ssl === true) ? "https://" : "http://") +  this.config.host + ":" + this.config.port + "/dashboard-solo/db/" + this.config.dashboardname+  "?orgId=" + this.config.orgId
            for (var i = 0 ; i < this.config.showIDs.length; i++) {
                img += '<iframe src="' + url + '&panelId='+this.config.showIDs[i]+'" width="' + this.config.width + '" height="' + this.config.height + '" frameborder="0" scrolling="no"></iframe>';
            }
            Log.info('img=' + img);
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
        if (this.config.host === "") {
            Log.error("Tried to refresh, iFrameReload URL not set!");
            return;
        }
        // Change url to force refresh?
        this.src = ((this.config.ssl === true) ? "https://" : "http://") +  this.config.host + ":" + this.config.port + "/dashboard-solo/db/" + this.config.dashboardname+  "?orgId=" + this.config.orgId;
        this.updateDom(this.config.animationSpeed);
        this.scheduleUpdate(this.config.refreshInterval);
    }
});
