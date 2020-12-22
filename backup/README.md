# mines
A simple javascript minesweeper game.

I wanted to try building a project using only the developer console in Chrome so I decided to write a minesweeper game.  Minesweeper has always been my go to passtime whenever I find myself watching progress bars.

If you'd like to play you can find the game at https://thelowman.github.io/mines/

If you don't know how to play, just start clicking around and you can figure it out pretty fast.


## Using Chrome Dev Tools
As I said before, this page was built using the dev console in Chrome.

Overall Chrome is easy to use as an editor and the debugging tools are top notch.  To get started using the Dev Tools for writing code all you have to do is drop a folder into the Dev Tools and start coding.  Well, almost.  There are a few tweaks and adjustments I had to make to get productive.

The first thing I did was to go to Chrome Dev Tools -> Settings -> Preferences -> Sources and set up my default indentation.  Then in the left pane I clicked the Filesystem tab.  From here you can add new files.  You can't add new files from the default "Page" tab and I spent some time searching for a way until I found this.

There are a few things that take a little getting used to though.  First of all, there is no alt-f-s keyboard combination for saving your changes because there isn't a file menu (or at least I couldn't find it).  You have to save your work by pressing ctrl-s.  My hands are so used to the alt-f-s combination that I kept leaving small "s" characters randomly in my code.  But after a short while that problem went away.

One thing that would be nice is to be able to use ctrl + [pg up] and ctrl + [pg dn] to switch tabs.  Both Sublime Text and even the Chrome Browser support this combination and it would be really terrific if the Dev Tools would as well.  For now though you have to keep grabbing the mouse to switch tabs, which I found supprisingly annoying after being used to using the keyboard.

Multiple cursors work just like Sublime Text. Commenting out blocks of code works just like Sublime Text.  Highlight the section you want to comment out and press ctrl + / and the section becomes a comment.  Nice.

Possibly the most useful feature of Dev Tools as an editor is that you can edit your styles from the "elements" tab and the changes go straight into your css source files.  It's so nice to be able to get that immediate feedback while you make those tweaks, knowing that when you're satisfied you don't have to remember all the things you changed so you can copy them into some other editor.
