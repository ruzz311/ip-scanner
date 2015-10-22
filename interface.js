'use strict';

var blessed = require('blessed'),
    opener = require('opener'),
    util = require('util');

module.exports = {
    create: createScreen
};


function createScreen(title /*string*/, done /*function*/) {
    var box, screen, list, progressbar;
    // Create a screen object.
    screen = blessed.screen({
        smartCSR: true,
        //autoPadding: true,
        debug: true
    });

    screen.title = title;

    // Create a box perfectly centered horizontally and vertically.
    box = blessed.box({
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        content: 'Starting...',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'transparent',
            border: {
                fg: '#f0f0f0'
            }
        }
    });

    list = blessed.list({
        top: '60',
        left: '10',
        width: '120',
        height: '100%-40',
        style: {
            fg: '#777777',
            bg: 'transparent',
            item: {
                fg: '#777777',
                hover: {
                    fg: 'white'
                }
            },
            selected: {
                fg: 'magenta',
                hover: {
                    fg: 'magenta'
                }
            }
        },
        mouse: true,
        keys: true,
        items: []
    });

    progressbar = blessed.ProgressBar({
        orientation: 'horizontal',
        top: '100%-4',
        left: '5',
        width: '100%-2',
        height: '40',
        //content: '0%',
        style: {
            bg: 'white',
            bar: {
                fg:'magenta',
                bg:'magenta'
            }
        },
        value: 20
    });

    list.on('select', function (event, index) {
        var url = event.content;
        screen.debug(url);
        opener(url);
        //console.log(arguments)
        //log.log(arguments.toString());
    });

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        done(ch, key);
        //killed = true;
        //clearTimeout(timer);
        //return process.exit(0);
    });

    // Append our box to the screen.
    screen.append(box);
    //box.append(text);
    box.append(progressbar);
    box.append(list);
    list.focus();

    // Render the screen.
    screen.render();

    return {
        screen: screen,
        box: box,
        list: list,
        progressbar: progressbar
    };
}