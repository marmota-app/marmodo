# marmodo - The Marmota Markdown Library

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
