# SX Scripting

SX is an embedded scripting language that allows simple calculations within
the markdown files. It is only supported in certain elements:

* Custom inlines (`{{script}}{options}`)
* Custom table cells (`|{{script}}|`)

Those elements don't show their content directly; instead, they get their
displayed value from running the script.

## The Document Tree

After parsing a markdown document for the first time, there is a tree where
the parent-child relationship of every element is already established (there
is a `parent` field in each element, and a `content` array which contains the
children). This parent-child relationship is updated correclty when parsing
updates.

Also, while parsing, an SX language context is passed down the call hierarchy.
SX language contexts can be nested to create different scopes for variables.
The `Table` element, for example, creates a new SX language context with a
nested scope inside the document scope.

## Evaluation

During parsing the document, no scripts are evaluated, but they are registered
with the sx context. The script is only evaluated when the result is needed.

Scripts/Results can also be referenced by other scripts. Some scripts have
an implicit name that can be referenced, like custom table cells. For others,
like custom inlines, the name of the result is the default option. Parsers
of those elements will register the result with the correct name.

### Dependencies

Every script evaluation can depend on other results. Those dependencies
are determined during SX parsing, but the parser does not yet try to resolve
them. It only records them with their name (and maybe also compatible types,
but that might also be done later).

### Evaluation ID

After the markdown document was first parsed or updated, all scripts are
evaluated. With that, the caller provides an evaluation ID. If a script
already has a value for this evaluation ID, it can immediately return the
value. Otherwise, it will get the values of all dependencies, evaluate its
own value, cache it with the ID and return it.

With the evaluation ID, the evaluation can also detect circular references!

When parsing an update, there is one more thing to do: When evaluating the
script has changed the result of a script, the listeners for that element
must be notified.
