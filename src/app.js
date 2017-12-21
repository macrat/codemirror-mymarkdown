import CodeMirror from 'codemirror';
import widgets from 'codemirror-widgets';

import _ from 'codemirror/lib/codemirror.css';
import _ from 'codemirror/mode/gfm/gfm.js';

import _ from 'codemirror/addon/mode/overlay.js';


CodeMirror.defineMode('mymark', function(config, parserConfig) {
	let imageLink = false;
	let blobImage = false;

	return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'markdown'), {
		token: function(stream, state) {
			while (true) {
				if (imageLink && stream.match(/\(data:(?=.*\))/, true)) {
					imageLink = false;
					blobImage = true;
					return 'image string url blob-image blob-image-marker-start';
				} else if (blobImage && stream.eatWhile(x => x !== ')')) {
					return 'image string url blob-image blob-image-data';
				} else if (blobImage && stream.eat(')')) {
					blobImage = false;
					return 'image string url blob-image blob-image-marker-end';
				} else if (imageLink && stream.match(/\(.*\)/, true)) {
					imageLink = false;
					return 'image string url';
				} else if (stream.sol() && stream.match(/#+ +(?=.*)/, true)) {
					return 'header mark';
				} else if (stream.match(/!\[.*?\](?=\(.*?\))/, true)) {
					imageLink = true;
					return 'image image-alt-text link';
				} else if (stream.next() == null) {
					break;
				}
			}
			return null;
		},
	});
});


const cm = CodeMirror.fromTextArea(document.querySelector('#app'), {
	mode: 'mymark',
	lineWrapping: true,
});


const imageThumbnail = widgets.createType({
	mixins: [
		widgets.mixins.re(/!\[(.*?)\]\((.*?)\)/g, match => {
			return {
				props: {
					alt: match[1],
					src: match[2],
				},
			};
		}),
	],
	debounceWait: 10,
	findEditRange: function(range) {
		const ret = {
			from: { line: range.from.line - 1, ch: 0 },
			to: { line: range.to.line + 1, ch: 0 },
		};
		return ret;
	},
	createElement: function(widget) {
		const img = document.createElement('img');
		img.src = widget.props.src;
		img.alt = widget.props.alt;
		img.title = widget.props.alt;
		img.classList.add('cm-thumbnail');
		img.classList.add('cm-thumbnail-image');
		img.addEventListener('error', function() {
			this.classList.add('cm-thumbnail-missing');
		});
		return img;
	},
});

const manager = widgets.createManager(cm);
manager.enable(imageThumbnail);
