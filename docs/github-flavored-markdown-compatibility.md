# Markdown compatibility

## 1.1 What is GitHub Flavored Markdown? - Implemented
## 1.2 What is Markdown? - Implemented
## 1.3 Why is a spec needed? - Implemented
## 1.4 About this document - Implemented
## 2.1 Characters and lines - Implemented
## 2.2 NOT yet Implemented
## 2.3 NOT yet Implemented
## 3.1 NOT yet Implemented
## 3.2 Container blocks and leaf blocks - Implemented
## 4.1 NOT yet Implemented
## 4.2 ATX headings - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 35: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  \## foo
  
  ```
  Expected HTML:
  ```html
  <p>## foo</p>
  
  ```
* Example 36: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  # foo *bar* \*baz\*
  
  ```
  Expected HTML:
  ```html
  <h1>foo <em>bar</em> *baz*</h1>
  
  ```
* INCOMPATIBLE - Example 37: Trailing spaces are not removed;  
  Markdown input:
  ```markdown
  #                  foo                     
  
  ```
  Expected HTML:
  ```html
  <h1>foo</h1>
  
  ```
* Example 38: Indenting elements with up-to three whitespace characters;  
  Markdown input:
  ```markdown
   ### foo
    ## foo
     # foo
  
  ```
  Expected HTML:
  ```html
  <h3>foo</h3>
  <h2>foo</h2>
  <h1>foo</h1>
  
  ```
* Example 39: Element still missing: Indented code block;  
  Markdown input:
  ```markdown
      # foo
  
  ```
  Expected HTML:
  ```html
  <pre><code># foo
  </code></pre>
  
  ```
* Example 40: Continuing a paragraph with indentation after the first line;  
  Markdown input:
  ```markdown
  foo
      # bar
  
  ```
  Expected HTML:
  ```html
  <p>foo
  # bar</p>
  
  ```
* Example 41: Missing feature: Closing sequences of "#" and " " after a heading;  
  Markdown input:
  ```markdown
  ## foo ##
    ###   bar    ###
  
  ```
  Expected HTML:
  ```html
  <h2>foo</h2>
  <h3>bar</h3>
  
  ```
* Example 42: Missing feature: Closing sequences of "#" and " " after a heading;  
  Markdown input:
  ```markdown
  # foo ##################################
  ##### foo ##
  
  ```
  Expected HTML:
  ```html
  <h1>foo</h1>
  <h5>foo</h5>
  
  ```
* Example 43: Missing feature: Closing sequences of "#" and " " after a heading;  
  Markdown input:
  ```markdown
  ### foo ###     
  
  ```
  Expected HTML:
  ```html
  <h3>foo</h3>
  
  ```
* Example 46: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  ### foo \###
  ## foo #\##
  # foo \#
  
  ```
  Expected HTML:
  ```html
  <h3>foo ###</h3>
  <h2>foo ###</h2>
  <h1>foo #</h1>
  
  ```
* Example 47: Element still missing: Horizontal rule;  
  Markdown input:
  ```markdown
  ****
  ## foo
  ****
  
  ```
  Expected HTML:
  ```html
  <hr />
  <h2>foo</h2>
  <hr />
  
  ```
* Example 49: Missing feature: Closing sequences of "#" and " " after a heading;  
  Markdown input:
  ```markdown
  ## 
  #
  ### ###
  
  ```
  Expected HTML:
  ```html
  <h2></h2>
  <h1></h1>
  <h3></h3>
  
  ```
## 4.3 NOT yet Implemented
## 4.4 NOT yet Implemented
## 4.5 NOT yet Implemented
## 4.6 NOT yet Implemented
## 4.7 NOT yet Implemented
## 4.8 Paragraphs - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 192: Indentation of lines that does not create any element;  
  Markdown input:
  ```markdown
    aaa
   bbb
  
  ```
  Expected HTML:
  ```html
  <p>aaa
  bbb</p>
  
  ```
* Example 193: Indentation of lines that does not create any element;  
  Markdown input:
  ```markdown
  aaa
               bbb
                                         ccc
  
  ```
  Expected HTML:
  ```html
  <p>aaa
  bbb
  ccc</p>
  
  ```
* Example 194: Indentation of lines that does not create any element;  
  Markdown input:
  ```markdown
     aaa
  bbb
  
  ```
  Expected HTML:
  ```html
  <p>aaa
  bbb</p>
  
  ```
* Example 195: Element still missing: Indented code block;  
  Markdown input:
  ```markdown
      aaa
  bbb
  
  ```
  Expected HTML:
  ```html
  <pre><code>aaa
  </code></pre>
  <p>bbb</p>
  
  ```
* Example 196: Element still missing: Line break;  
  Markdown input:
  ```markdown
  aaa     
  bbb     
  
  ```
  Expected HTML:
  ```html
  <p>aaa<br />
  bbb</p>
  
  ```
## 4.9 NOT yet Implemented
## 4.10 Tables (extension) - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 200: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  | f\|oo  |
  | ------ |
  | b `\|` az |
  | b **\|** im |
  
  ```
  Expected HTML:
  ```html
  <table>
  <thead>
  <tr>
  <th>f|oo</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>b <code>|</code> az</td>
  </tr>
  <tr>
  <td>b <strong>|</strong> im</td>
  </tr>
  </tbody>
  </table>
  
  ```
* Example 201: Element still missing: Block quote;  
  Markdown input:
  ```markdown
  | abc | def |
  | --- | --- |
  | bar | baz |
  > bar
  
  ```
  Expected HTML:
  ```html
  <table>
  <thead>
  <tr>
  <th>abc</th>
  <th>def</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>bar</td>
  <td>baz</td>
  </tr>
  </tbody>
  </table>
  <blockquote>
  <p>bar</p>
  </blockquote>
  
  ```
* INCOMPATIBLE - Example 203: Table header length does NOT have to match delimiter length in MfM (otherwise, update parsing would be extremely annoying, switching between table and paragraph all the time);  
  Markdown input:
  ```markdown
  | abc | def |
  | --- |
  | bar |
  
  ```
  Expected HTML:
  ```html
  <p>| abc | def |
  | --- |
  | bar |</p>
  
  ```
## 5.1 NOT yet Implemented
## 5.2 NOT yet Implemented
## 5.3 NOT yet Implemented
## 5.4 NOT yet Implemented
## 6.1 NOT yet Implemented
## 6.2 NOT yet Implemented
## 6.3 NOT yet Implemented
## 6.4 Emphasis and strong emphasis - Implemented

Except **not yet implemented** functionality and known **incompatibilities**:

* Example 362: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  a*"foo"*
  
  ```
  Expected HTML:
  ```html
  <p>a*&quot;foo&quot;*</p>
  
  ```
* Example 368: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  a_"foo"_
  
  ```
  Expected HTML:
  ```html
  <p>a_&quot;foo&quot;_</p>
  
  ```
* INCOMPATIBLE - Example 369: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  foo_bar_
  
  ```
  Expected HTML:
  ```html
  <p>foo_bar_</p>
  
  ```
* INCOMPATIBLE - Example 370: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  5_6_78
  
  ```
  Expected HTML:
  ```html
  <p>5_6_78</p>
  
  ```
* INCOMPATIBLE - Example 371: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  пристаням_стремятся_
  
  ```
  Expected HTML:
  ```html
  <p>пристаням_стремятся_</p>
  
  ```
* Example 372: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  aa_"bb"_cc
  
  ```
  Expected HTML:
  ```html
  <p>aa_&quot;bb&quot;_cc</p>
  
  ```
* INCOMPATIBLE - Example 378: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *(*foo*)*
  
  ```
  Expected HTML:
  ```html
  <p><em>(<em>foo</em>)</em></p>
  
  ```
* INCOMPATIBLE - Example 382: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _(_foo_)_
  
  ```
  Expected HTML:
  ```html
  <p><em>(<em>foo</em>)</em></p>
  
  ```
* INCOMPATIBLE - Example 383: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _foo_bar
  
  ```
  Expected HTML:
  ```html
  <p>_foo_bar</p>
  
  ```
* INCOMPATIBLE - Example 384: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _пристаням_стремятся
  
  ```
  Expected HTML:
  ```html
  <p>_пристаням_стремятся</p>
  
  ```
* INCOMPATIBLE - Example 385: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _foo_bar_baz_
  
  ```
  Expected HTML:
  ```html
  <p><em>foo_bar_baz</em></p>
  
  ```
* Example 389: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  a**"foo"**
  
  ```
  Expected HTML:
  ```html
  <p>a**&quot;foo&quot;**</p>
  
  ```
* Example 394: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  a__"foo"__
  
  ```
  Expected HTML:
  ```html
  <p>a__&quot;foo&quot;__</p>
  
  ```
* INCOMPATIBLE - Example 395: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  foo__bar__
  
  ```
  Expected HTML:
  ```html
  <p>foo__bar__</p>
  
  ```
* INCOMPATIBLE - Example 396: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  5__6__78
  
  ```
  Expected HTML:
  ```html
  <p>5__6__78</p>
  
  ```
* INCOMPATIBLE - Example 397: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  пристаням__стремятся__
  
  ```
  Expected HTML:
  ```html
  <p>пристаням__стремятся__</p>
  
  ```
* INCOMPATIBLE - Example 398: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __foo, __bar__, baz__
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo, <strong>bar</strong>, baz</strong></p>
  
  ```
* INCOMPATIBLE - Example 402: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *(**foo**)*
  
  ```
  Expected HTML:
  ```html
  <p><em>(<strong>foo</strong>)</em></p>
  
  ```
* Example 404: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  **foo "*bar*" foo**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>
  
  ```
* INCOMPATIBLE - Example 408: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _(__foo__)_
  
  ```
  Expected HTML:
  ```html
  <p><em>(<strong>foo</strong>)</em></p>
  
  ```
* INCOMPATIBLE - Example 409: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __foo__bar
  
  ```
  Expected HTML:
  ```html
  <p>__foo__bar</p>
  
  ```
* INCOMPATIBLE - Example 410: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __пристаням__стремятся
  
  ```
  Expected HTML:
  ```html
  <p>__пристаням__стремятся</p>
  
  ```
* INCOMPATIBLE - Example 411: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __foo__bar__baz__
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo__bar__baz</strong></p>
  
  ```
* Example 413: Element still missing: Hyperlink;  
  Markdown input:
  ```markdown
  *foo [bar](/url)*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <a href="/url">bar</a></em></p>
  
  ```
* INCOMPATIBLE - Example 415: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _foo __bar__ baz_
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <strong>bar</strong> baz</em></p>
  
  ```
* INCOMPATIBLE - Example 416: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  _foo _bar_ baz_
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <em>bar</em> baz</em></p>
  
  ```
* INCOMPATIBLE - Example 417: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __foo_ bar_
  
  ```
  Expected HTML:
  ```html
  <p><em><em>foo</em> bar</em></p>
  
  ```
* INCOMPATIBLE - Example 419: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *foo **bar** baz*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <strong>bar</strong> baz</em></p>
  
  ```
* INCOMPATIBLE - Example 420: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *foo**bar**baz*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo<strong>bar</strong>baz</em></p>
  
  ```
* INCOMPATIBLE - Example 421: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *foo**bar*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo**bar</em></p>
  
  ```
* INCOMPATIBLE - Example 422: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  ***foo** bar*
  
  ```
  Expected HTML:
  ```html
  <p><em><strong>foo</strong> bar</em></p>
  
  ```
* INCOMPATIBLE - Example 424: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *foo**bar***
  
  ```
  Expected HTML:
  ```html
  <p><em>foo<strong>bar</strong></em></p>
  
  ```
* INCOMPATIBLE - Example 425: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  foo***bar***baz
  
  ```
  Expected HTML:
  ```html
  <p>foo<em><strong>bar</strong></em>baz</p>
  
  ```
* INCOMPATIBLE - Example 427: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *foo **bar *baz* bim** bop*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <strong>bar <em>baz</em> bim</strong> bop</em></p>
  
  ```
* Example 428: Element still missing: Hyperlink;  
  Markdown input:
  ```markdown
  *foo [*bar*](/url)*
  
  ```
  Expected HTML:
  ```html
  <p><em>foo <a href="/url"><em>bar</em></a></em></p>
  
  ```
* Example 431: Element still missing: Hyperlink;  
  Markdown input:
  ```markdown
  **foo [bar](/url)**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <a href="/url">bar</a></strong></p>
  
  ```
* INCOMPATIBLE - Example 434: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __foo __bar__ baz__
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <strong>bar</strong> baz</strong></p>
  
  ```
* INCOMPATIBLE - Example 435: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  ____foo__ bar__
  
  ```
  Expected HTML:
  ```html
  <p><strong><strong>foo</strong> bar</strong></p>
  
  ```
* INCOMPATIBLE - Example 441: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  **foo *bar **baz**
  bim* bop**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <em>bar <strong>baz</strong>
  bim</em> bop</strong></p>
  
  ```
* Example 442: Element still missing: Hyperlink;  
  Markdown input:
  ```markdown
  **foo [*bar*](/url)**
  
  ```
  Expected HTML:
  ```html
  <p><strong>foo <a href="/url"><em>bar</em></a></strong></p>
  
  ```
* Example 446: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  foo *\**
  
  ```
  Expected HTML:
  ```html
  <p>foo <em>*</em></p>
  
  ```
* Example 449: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  foo **\***
  
  ```
  Expected HTML:
  ```html
  <p>foo <strong>*</strong></p>
  
  ```
* INCOMPATIBLE - Example 451: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  **foo*
  
  ```
  Expected HTML:
  ```html
  <p>*<em>foo</em></p>
  
  ```
* INCOMPATIBLE - Example 453: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  ***foo**
  
  ```
  Expected HTML:
  ```html
  <p>*<strong>foo</strong></p>
  
  ```
* INCOMPATIBLE - Example 454: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  ****foo*
  
  ```
  Expected HTML:
  ```html
  <p>***<em>foo</em></p>
  
  ```
* Example 458: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  foo _\__
  
  ```
  Expected HTML:
  ```html
  <p>foo <em>_</em></p>
  
  ```
* Example 461: Escaping characters with backslashes;  
  Markdown input:
  ```markdown
  foo __\___
  
  ```
  Expected HTML:
  ```html
  <p>foo <strong>_</strong></p>
  
  ```
* INCOMPATIBLE - Example 463: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  __foo_
  
  ```
  Expected HTML:
  ```html
  <p>_<em>foo</em></p>
  
  ```
* INCOMPATIBLE - Example 465: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  ___foo__
  
  ```
  Expected HTML:
  ```html
  <p>_<strong>foo</strong></p>
  
  ```
* INCOMPATIBLE - Example 466: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  ____foo_
  
  ```
  Expected HTML:
  ```html
  <p>___<em>foo</em></p>
  
  ```
* INCOMPATIBLE - Example 476: Precedence of delimited elements with longer delimiter runs is different than in GfM (and should be avoided anyway);  
  Markdown input:
  ```markdown
  ***foo***
  
  ```
  Expected HTML:
  ```html
  <p><em><strong>foo</strong></em></p>
  
  ```
* INCOMPATIBLE - Example 477: Precedence of delimited elements with longer delimiter runs is different than in GfM (and should be avoided anyway);  
  Markdown input:
  ```markdown
  _____foo_____
  
  ```
  Expected HTML:
  ```html
  <p><em><strong><strong>foo</strong></strong></em></p>
  
  ```
* INCOMPATIBLE - Example 480: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  **foo **bar baz**
  
  ```
  Expected HTML:
  ```html
  <p>**foo <strong>bar baz</strong></p>
  
  ```
* INCOMPATIBLE - Example 481: Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported;  
  Markdown input:
  ```markdown
  *foo *bar baz*
  
  ```
  Expected HTML:
  ```html
  <p>*foo <em>bar baz</em></p>
  
  ```
* Example 482: Element still missing: Hyperlink;  
  Markdown input:
  ```markdown
  *[bar*](/url)
  
  ```
  Expected HTML:
  ```html
  <p>*<a href="/url">bar*</a></p>
  
  ```
* Example 483: Element still missing: Hyperlink;  
  Markdown input:
  ```markdown
  _foo [bar_](/url)
  
  ```
  Expected HTML:
  ```html
  <p>_foo <a href="/url">bar_</a></p>
  
  ```
* INCOMPATIBLE - Example 484: HTML Elements are not supported;  
  Markdown input:
  ```markdown
  *<img src="foo" title="*"/>
  
  ```
  Expected HTML:
  ```html
  <p>*<img src="foo" title="*"/></p>
  
  ```
* INCOMPATIBLE - Example 485: HTML Elements are not supported;  
  Markdown input:
  ```markdown
  **<a href="**">
  
  ```
  Expected HTML:
  ```html
  <p>**<a href="**"></p>
  
  ```
* INCOMPATIBLE - Example 486: HTML Elements are not supported;  
  Markdown input:
  ```markdown
  __<a href="__">
  
  ```
  Expected HTML:
  ```html
  <p>__<a href="__"></p>
  
  ```
* Example 487: Element still missing: Inline code spans;  
  Markdown input:
  ```markdown
  *a `*`*
  
  ```
  Expected HTML:
  ```html
  <p><em>a <code>*</code></em></p>
  
  ```
* Example 488: Element still missing: Inline code spans;  
  Markdown input:
  ```markdown
  _a `_`_
  
  ```
  Expected HTML:
  ```html
  <p><em>a <code>_</code></em></p>
  
  ```
* INCOMPATIBLE - Example 489: HTML Elements are not supported;  
  Markdown input:
  ```markdown
  **a<http://foo.bar/?q=**>
  
  ```
  Expected HTML:
  ```html
  <p>**a<a href="http://foo.bar/?q=**">http://foo.bar/?q=**</a></p>
  
  ```
* INCOMPATIBLE - Example 490: HTML Elements are not supported;  
  Markdown input:
  ```markdown
  __a<http://foo.bar/?q=__>
  
  ```
  Expected HTML:
  ```html
  <p>__a<a href="http://foo.bar/?q=__">http://foo.bar/?q=__</a></p>
  
  ```
## 6.5 NOT yet Implemented
## 6.6 NOT yet Implemented
## 6.7 NOT yet Implemented
## 6.8 NOT yet Implemented
## 6.9 NOT yet Implemented
## 6.10 NOT yet Implemented
## 6.11 NOT yet Implemented
## 6.12 NOT yet Implemented
## 6.13 NOT yet Implemented
## 6.14 NOT yet Implemented