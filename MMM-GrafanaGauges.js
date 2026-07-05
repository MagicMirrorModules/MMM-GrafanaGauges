Module.register('MMM-GrafanaGauges', {
	// Default module config.
	defaults: {
		height: '100',
		width: '100',
		refreshInterval: 900,
		animationSpeed: 1000,
		https: false,
		version: 0,
		hideLogo: true,
		spacing: '0',
		align: 'left',
	},

	// Define start sequence.
	start() {
		Log.info('Starting module: ' + this.name + '!!!!');
		this.scheduleUpdate(this.config.refreshInterval);
	},

	// Define required CSS files.
	getStyles() {
		return ['MMM-GrafanaGauges.css'];
	},

	// Override dom generator.
	getDom() {
		const wrapper = document.createElement('div');
		wrapper.className = 'mmm-grafana-gauges';
		if (!this.config.host) {
			Log.error('MMM-GrafanaGauges: config.host is required');
			return wrapper;
		}

		const protocol = this.config.https === true ? 'https://' : 'http://';
		const version = Number(this.config.version) || 0;
		let baseUrl;

		if (version >= 6) {
			if (!this.config.id) {
				Log.error('MMM-GrafanaGauges: config.id is required for Grafana 6+');
				return wrapper;
			}

			baseUrl = protocol + this.config.host + ':' + this.config.port
				+ '/d-solo/' + this.config.id + '/' + this.config.dashboardname
				+ '?orgId=' + this.config.orgId + '&fullscreen&kiosk';
		} else {
			baseUrl = protocol + this.config.host + ':' + this.config.port + '/dashboard-solo/db/' + this.config.dashboardname + '?orgId=' + this.config.orgId;
		}

		const hideLogo = this.config.hideLogo ? '&hideLogo=true' : '';
		if (Array.isArray(this.config.showIDs) && this.config.showIDs.length > 0) {
			for (let i = 0; i < this.config.showIDs.length; i++) {
				const iframe = document.createElement('iframe');
				iframe.src = baseUrl + '&panelId=' + this.config.showIDs[i] + hideLogo;
				iframe.width = this.config.width;
				iframe.height = this.config.height;
				iframe.setAttribute('frameborder', '0');
				iframe.setAttribute('scrolling', 'no');
				wrapper.append(iframe);
			}
		} else {
			Log.warn('MMM-GrafanaGauges: config.showIDs is empty or missing');
		}

		const alignInput = this.config.align || 'left';
		const align = ['left', 'center', 'right'].includes(alignInput) ? alignInput : 'left';
		if (alignInput !== align) {
			Log.warn('MMM-GrafanaGauges: invalid config.align value \'' + alignInput + '\'. Allowed values: left, center, right. Falling back to left.');
		}

		wrapper.classList.add('mmm-grafana-gauges--align-' + align);
		wrapper.style.setProperty('--mmm-grafana-gauges-gap', this.config.spacing || '0');
		wrapper.setAttribute('timestamp', Date.now());
		return wrapper;
	},

	scheduleUpdate(delay) {
		const nextLoad = delay !== undefined && delay >= 0 ? delay * 1000 : this.config.refreshInterval;
		setTimeout(() => {
			this.updateFrame();
		}, nextLoad);
	},

	updateFrame() {
		if (!this.config.host) {
			Log.error('Tried to refresh, iFrameReload URL not set!');
			return;
		}

		this.updateDom(this.config.animationSpeed);
		this.scheduleUpdate(this.config.refreshInterval);
	},
});
