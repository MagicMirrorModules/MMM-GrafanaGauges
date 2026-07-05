const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {JSDOM} = require('jsdom');

const modulePath = path.join(__dirname, '..', '..', 'MMM-GrafanaGauges.js');

function createDocument() {
	const {window} = new JSDOM('<!doctype html><html><body></body></html>');
	return window.document;
}

function loadModuleDefinition() {
	return loadModuleDefinitionWithLogger().moduleDefinition;
}

function createLoggerSpy() {
	const calls = {
		info: [],
		warn: [],
		error: [],
	};

	const logger = {
		info(message) {
			calls.info.push(message);
		},
		warn(message) {
			calls.warn.push(message);
		},
		error(message) {
			calls.error.push(message);
		},
	};

	return {calls, logger};
}

function loadModuleDefinitionWithLogger(logger = createLoggerSpy().logger) {
	let moduleDefinition;

	globalThis.Module = {
		register(name, definition) {
			assert.equal(name, 'MMM-GrafanaGauges');
			moduleDefinition = definition;
		},
	};
	globalThis.Log = logger;

	delete require.cache[require.resolve(modulePath)];
	require(modulePath);

	assert.ok(moduleDefinition);
	return {moduleDefinition};
}

function buildConfig(overrides = {}) {
	return {
		host: 'localhost',
		port: 3000,
		https: false,
		version: 6,
		id: 'as8fA8na',
		dashboardname: 'flowers',
		orgId: 1,
		showIDs: [8],
		width: '100%',
		height: '100%',
		hideLogo: true,
		spacing: '0',
		align: 'left',
		...overrides,
	};
}

test('builds encoded Grafana 6 iframe URL and applies spacing/alignment', () => {
	globalThis.document = createDocument();
	const definition = loadModuleDefinition();
	const config = buildConfig({
		host: 'grafana.local',
		id: 'my uid/1',
		dashboardname: 'My board/2',
		orgId: '1&2',
		showIDs: ['9&10'],
		spacing: '8px',
		align: 'center',
	});

	const wrapper = definition.getDom.call({config});
	const iframe = wrapper.querySelector('iframe');
	assert.ok(iframe);

	const iframeUrl = new URL(iframe.src);
	assert.equal(iframeUrl.pathname, '/d-solo/my%20uid%2F1/My%20board%2F2');
	assert.equal(iframeUrl.searchParams.get('orgId'), '1&2');
	assert.equal(iframeUrl.searchParams.get('panelId'), '9&10');
	assert.equal(iframeUrl.searchParams.get('hideLogo'), 'true');
	assert.ok(iframeUrl.searchParams.has('fullscreen'));
	assert.ok(iframeUrl.searchParams.has('kiosk'));
	assert.ok(wrapper.classList.contains('mmm-grafana-gauges--align-center'));
	assert.equal(wrapper.style.getPropertyValue('--mmm-grafana-gauges-gap'), '8px');
});

test('builds legacy Grafana URL for versions below 6', () => {
	globalThis.document = createDocument();
	const definition = loadModuleDefinition();
	const config = buildConfig({
		version: 5,
		dashboardname: 'Legacy board/42',
		hideLogo: false,
		showIDs: [12],
	});

	const wrapper = definition.getDom.call({config});
	const iframe = wrapper.querySelector('iframe');
	assert.ok(iframe);

	const iframeUrl = new URL(iframe.src);
	assert.equal(iframeUrl.pathname, '/dashboard-solo/db/Legacy%20board%2F42');
	assert.equal(iframeUrl.searchParams.get('panelId'), '12');
	assert.equal(iframeUrl.searchParams.get('orgId'), '1');
	assert.equal(iframeUrl.searchParams.get('hideLogo'), null);
});

test('falls back to left alignment for invalid align values', () => {
	globalThis.document = createDocument();
	const definition = loadModuleDefinition();
	const config = buildConfig({
		align: 'diagonal',
	});

	const wrapper = definition.getDom.call({config});
	assert.ok(wrapper.classList.contains('mmm-grafana-gauges--align-left'));
});

test('logs error and returns empty wrapper when host is missing', () => {
	globalThis.document = createDocument();
	const {calls, logger} = createLoggerSpy();
	const {moduleDefinition} = loadModuleDefinitionWithLogger(logger);
	const config = buildConfig({
		host: '',
	});

	const wrapper = moduleDefinition.getDom.call({config});
	assert.equal(wrapper.querySelectorAll('iframe').length, 0);
	assert.equal(calls.error.length, 1);
	assert.match(calls.error[0], /config.host is required/v);
});

test('logs error for Grafana 6+ when id is missing', () => {
	globalThis.document = createDocument();
	const {calls, logger} = createLoggerSpy();
	const {moduleDefinition} = loadModuleDefinitionWithLogger(logger);
	const config = buildConfig({
		id: '',
		version: 6,
	});

	const wrapper = moduleDefinition.getDom.call({config});
	assert.equal(wrapper.querySelectorAll('iframe').length, 0);
	assert.equal(calls.error.length, 1);
	assert.match(calls.error[0], /config.id is required/v);
});

test('logs warning when showIDs is empty', () => {
	globalThis.document = createDocument();
	const {calls, logger} = createLoggerSpy();
	const {moduleDefinition} = loadModuleDefinitionWithLogger(logger);
	const config = buildConfig({
		showIDs: [],
	});

	const wrapper = moduleDefinition.getDom.call({config});
	assert.equal(wrapper.querySelectorAll('iframe').length, 0);
	assert.equal(calls.warn.length, 1);
	assert.match(calls.warn[0], /showIDs is empty or missing/v);
});

test('renders one iframe per panel id in input order', () => {
	globalThis.document = createDocument();
	const definition = loadModuleDefinition();
	const config = buildConfig({
		showIDs: [12, 8, 9],
	});

	const wrapper = definition.getDom.call({config});
	const iframes = [...wrapper.querySelectorAll('iframe')];
	assert.equal(iframes.length, 3);

	const panelIds = iframes.map(iframe => new URL(iframe.src).searchParams.get('panelId'));
	assert.deepEqual(panelIds, ['12', '8', '9']);
});

test('getStyles returns module stylesheet', () => {
	const definition = loadModuleDefinition();
	assert.deepEqual(definition.getStyles(), ['MMM-GrafanaGauges.css']);
});

test('start schedules first update using refreshInterval', () => {
	const definition = loadModuleDefinition();
	const scheduleCalls = [];
	const context = {
		name: 'MMM-GrafanaGauges',
		config: {refreshInterval: 42},
		scheduleUpdate(value) {
			scheduleCalls.push(value);
		},
	};

	definition.start.call(context);
	assert.deepEqual(scheduleCalls, [42]);
});

test('scheduleUpdate converts both explicit delay and fallback to milliseconds', () => {
	const definition = loadModuleDefinition();
	const originalSetTimeout = setTimeout;
	const delays = [];

	globalThis.setTimeout = (handler, delay) => {
		delays.push(delay);
		handler();
		return 1;
	};

	const context = {
		config: {refreshInterval: 7},
		updateFrame() {},
	};

	definition.scheduleUpdate.call(context, 2);
	definition.scheduleUpdate.call(context);

	globalThis.setTimeout = originalSetTimeout;
	assert.deepEqual(delays, [2000, 7000]);
});

test('updateFrame logs error and aborts when host is missing', () => {
	const {calls, logger} = createLoggerSpy();
	const {moduleDefinition} = loadModuleDefinitionWithLogger(logger);
	let updateDomCalls = 0;
	let scheduleCalls = 0;
	const context = {
		config: {
			host: '',
			animationSpeed: 1000,
			refreshInterval: 5,
		},
		updateDom() {
			updateDomCalls++;
		},
		scheduleUpdate() {
			scheduleCalls++;
		},
	};

	moduleDefinition.updateFrame.call(context);
	assert.equal(calls.error.length, 1);
	assert.equal(updateDomCalls, 0);
	assert.equal(scheduleCalls, 0);
});

test('updateFrame calls updateDom and schedules next refresh', () => {
	const definition = loadModuleDefinition();
	const calls = {
		schedule: [],
		updateDom: [],
	};
	const context = {
		config: {
			host: 'localhost',
			animationSpeed: 250,
			refreshInterval: 13,
		},
		updateDom(speed) {
			calls.updateDom.push(speed);
		},
		scheduleUpdate(delay) {
			calls.schedule.push(delay);
		},
	};

	definition.updateFrame.call(context);
	assert.deepEqual(calls.updateDom, [250]);
	assert.deepEqual(calls.schedule, [13]);
});
