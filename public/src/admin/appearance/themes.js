'use strict';

define('admin/appearance/themes', ['bootbox', 'translator', 'alerts'], function (bootbox, translator, alerts) {
	const Themes = {};

	Themes.init = function () {
		$('#installed_themes').on('click', function (e) {
			const target = $(e.target);
			const action = target.attr('data-action');

			if (action && action === 'use') {
				const parentEl = target.parents('[data-theme]');
				const themeType = parentEl.attr('data-type');
				const cssSrc = parentEl.attr('data-css');
				const themeId = parentEl.attr('data-theme');

				if (config['theme:id'] === themeId) {
					return;
				}
				setTheme(themeType, themeId, cssSrc, alerts);
			}
		});

		$('#revert_theme').on('click', function () {
			if (config['theme:id'] === 'nodebb-theme-harmony') {
				return;
			}
			bootbox.confirm('[[admin/appearance/themes:revert-confirm]]', function (confirm) {
				if (confirm) {
					socket.emit('admin.themes.set', {
						type: 'local',
						id: 'nodebb-theme-harmony',
					}, function (err) {
						if (err) {
							return alerts.error(err);
						}
						config['theme:id'] = 'nodebb-theme-harmony';
						highlightSelectedTheme('nodebb-theme-harmony');
						alerts.alert({
							alert_id: 'admin:theme',
							type: 'success',
							title: '[[admin/appearance/themes:theme-changed]]',
							message: '[[admin/appearance/themes:revert-success]]',
							timeout: 3500,
						});
					});
				}
			});
		});

		socket.emit('admin.themes.getInstalled', function (err, themes) {
			if (err) {
				return alerts.error(err);
			}

			const instListEl = $('#installed_themes');

			if (!themes.length) {
				instListEl.append($('<li/ >').addClass('no-themes').translateHtml('[[admin/appearance/themes:no-themes]]'));
			} else {
				app.parseAndTranslate('admin/partials/theme_list', {
					themes: themes,
				}, function (html) {
					instListEl.html(html);
					highlightSelectedTheme(config['theme:id']);
				});
			}
		});
	};
	// helper functions generated with gpt 
	// made revisions such as defining theme, 
	// fixing tabs, 
	// changing varnames
	function setTheme(themeType, themeId, cssSrc, alerts) {
		// 1. Send the socket event
		socket.emit('admin.themes.set', {
			type: themeType,
			id: themeId,
			src: cssSrc,
		}, function (err) {
			if (err) {
				return alerts.error(err);
			}
			// 2. Perform immediate post-set actions
			config['theme:id'] = themeId;
			highlightSelectedTheme(themeId);
			// 3. Show alert & bind its click handler
			showThemeChangedAlert();
		});
	}

	function showThemeChangedAlert() {
		alerts.alert({
			alert_id: 'admin:theme',
			type: 'info',
			title: '[[admin/appearance/themes:theme-changed]]',
			message: '[[admin/appearance/themes:restart-to-activate]]',
			timeout: 5000,
			clickfn: onThemeAlertClick,
		});
	}

	function onThemeAlertClick() {
		// Require asynchronously so we don’t block the main flow
		require(['admin/modules/instance'], function (instance) {
			instance.rebuildAndRestart();
		});
	}
	function highlightSelectedTheme(themeId) {
		translator.translate('[[admin/appearance/themes:select-theme]]  ||  [[admin/appearance/themes:current-theme]]', function (text) {
			text = text.split('  ||  ');
			const select = text[0];
			const current = text[1];

			$('[data-theme]')
				.removeClass('selected')
				.find('[data-action="use"]')
				.html(select)
				.removeClass('btn-success')
				.addClass('btn-primary');

			$('[data-theme="' + themeId + '"]')
				.addClass('selected')
				.find('[data-action="use"]')
				.html(current)
				.removeClass('btn-primary')
				.addClass('btn-success');
		});
	}

	return Themes;
});
