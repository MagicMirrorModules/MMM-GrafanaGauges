module.exports = [
	{
		files: ['MMM-GrafanaGauges.js'],
		languageOptions: {
			globals: {
				Module: 'readonly',
				Log: 'readonly',
				document: 'readonly',
				setTimeout: 'readonly',
			},
		},
		rules: {
			'unicorn/filename-case': 'off',
		},
	},
	{
		files: ['changelog.config.js', 'demo.config.js', 'xo.config.js'],
		rules: {
			'unicorn/prefer-module': 'off',
		},
	},
	{
		files: ['test/**/*.js'],
		rules: {
			'unicorn/filename-case': 'off',
			'unicorn/no-global-object-property-assignment': 'off',
			'unicorn/prefer-module': 'off',
		},
	},
];
