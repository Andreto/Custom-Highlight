# Known issues
This is a list of currently known issues in Custom-Highlight. Some of them have solutions, and some of them don't. If you have found a bug or a problem that is not listed here or if you think you have a solution to any of the problems then feel free to create an issue in the [Custom-Highlight GitHub repository](https://github.com/Andreto/Custom-Highlight/issues).

### Highlight-color is not set correctly on some sites.
Some sites have their own highlight-color set and depending on where in the document this is set it might overwrite Custom-Highlights color.
<br>__Fix:__
Since version _1.4.3 (Still in development)_ it's possible to turn on [aggressive overwrite](https://andreto.github.io/Custom-Highlight/docs/advanced-options#aggressive-overwrite) in the [advanced options](https://andreto.github.io/Custom-Highlight/docs/advanced-options) which will in most cases overwrite any other styling set on the highlight-colors.

### The color does not line up exactly with the set color. (No fix)
For example really dark colors on light background will become slightly lighter and really light colors on dark background will become slightly darker. Text-highlight on chrome is always rendered with slight transparency and there is really nothing that can be done about that.

### The color value and preview doesn't update correctly in the popup. (No fix) [#7](https://github.com/Andreto/Custom-Highlight/issues/7)
__This is as far as I know only an issue when loading the extension unpacked.__ <br>
Sometimes the `pickr.setColor` action is not fired and the color value and the preview-box is not updated. Read more in [this issue (#7)](https://github.com/Andreto/Custom-Highlight/issues/7).
