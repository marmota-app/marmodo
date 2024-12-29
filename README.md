# marmodo - The Marmota Markdown Library

## Commercial License Option

Are you interested in a commercial license? Contact David Tanzer: [business@davidtanzer.net](mailto:business@davidtanzer.net).

## Compatibility with the Legacy Parser

marmodo aims to be compatible with the marmota.app legacy parser on a semantic
level: Text that can be parsed with marmota.app must lead to a sematically
similar document with marmodo.

**But** marmodo does **not** aim to be compatible structurally: The document
structure created by marmodo differs in several small details.

1. marmodo creates sections for each headline, making it easier to determine
   the sections of a document
2. marmodo uses the `content` property **only** for contained children,
   **not** for text content
3. marmodo treats new lines as part of the text content of an element, not
   as a separate element
4. marmodo appends blank lines to the previous element, not to the containing
   element
5. and more...

Because of that, marmodo is not a drop-in replacement for the legacy parser,
but it ensures that presentations made with old versions of marmota.app
will still work in versions that use marmodo.

## Compatibility with GitHub Flavored Markdown

## LICENSE

```
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

See [LICENSE.md](LICENSE.md)
