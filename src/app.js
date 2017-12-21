import CodeMirror from 'codemirror';

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

function insertThumbnail(cm, change) {
	var line = 0;
	cm.eachLine(x => {
		if (!x.styles) {
			return;
		}

		line += 1;
		let addr = null;
		for (var i=1; i<x.styles.length-1; i+=2) {
			console.log(x.styles[i+1] && x.styles[i+1].split(' '));
			if (x.styles[i+1] && x.styles[i+1].split(' ').includes('blob-image-data')) {
				if (addr === null) {
					addr = 'data:' + x.text.slice(x.styles[i-2], x.styles[i]);
				} else {
					addr += x.text.slice(x.styles[i-2], x.styles[i]);
				}
			} else if (addr !== null) {
				const el = document.createElement('img');
				el.src = addr;
				el.class = 'cm-image-thumbnail';
				cm.addLineWidget(line, el);
				addr = null;
			}
		}
	});
}

cm.on('change', insertThumbnail);

insertThumbnail(cm, null);
