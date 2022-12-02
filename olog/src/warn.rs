/// Constructs an event at the warn level.
///
/// This functions similarly to the [`tracing::warn!`] macro. However, the current trace_id and
/// span_id are automatically added as fields.
///
/// # Examples
///
/// ```rust
/// use olog::warn;
/// # fn main() {
///
/// let warn_description = "Invalid Input";
/// let input = &[0x27, 0x45];
///
/// warn!(?input, warning = warn_description);
/// warn!(
///     target: "input_events",
///     warning = warn_description,
///     "Received warning for input: {:?}", input,
/// );
/// # }
/// ```
#[macro_export]
macro_rules! warn {
	(target: $target:expr, parent: $parent:expr, { $($field:tt)* }, $($arg:tt)* ) => (
        tracing::event!(target: $target, parent: $parent, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($field)* }, $($arg)*)
    );
    (target: $target:expr, parent: $parent:expr, $($k:ident).+ $($field:tt)+ ) => (
        tracing::event!(target: $target, parent: $parent, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ $($field)+ })
    );
    (target: $target:expr, parent: $parent:expr, ?$($k:ident).+ $($field:tt)+ ) => (
        tracing::event!(target: $target, parent: $parent, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ $($field)+ })
    );
    (target: $target:expr, parent: $parent:expr, %$($k:ident).+ $($field:tt)+ ) => (
        tracing::event!(target: $target, parent: $parent, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ $($field)+ })
    );
    (target: $target:expr, parent: $parent:expr, $($arg:tt)+ ) => (
        tracing::event!(target: $target, parent: $parent, tracing::Level::WARN, {trace_id = $crate::trace_id!(), span_id = $crate::span_id!() }, $($arg)+)
    );
    (parent: $parent:expr, { $($field:tt)+ }, $($arg:tt)+ ) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($field)+ },
            $($arg)+
        )
    );
    (parent: $parent:expr, $($k:ident).+ = $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ = $($field)*}
        )
    );
    (parent: $parent:expr, ?$($k:ident).+ = $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), ?$($k).+ = $($field)*}
        )
    );
    (parent: $parent:expr, %$($k:ident).+ = $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), %$($k).+ = $($field)*}
        )
    );
    (parent: $parent:expr, $($k:ident).+, $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+, $($field)*}
        )
    );
    (parent: $parent:expr, ?$($k:ident).+, $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), ?$($k).+, $($field)*}
        )
    );
    (parent: $parent:expr, %$($k:ident).+, $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), %$($k).+, $($field)*}
        )
    );
    (parent: $parent:expr, $($arg:tt)+) => (
        tracing::event!(
            target: module_path!(),
            parent: $parent,
            tracing::Level::WARN,
            {trace_id = $crate::trace_id!(), span_id = $crate::span_id!() },
            $($arg)+
        )
    );
    (target: $target:expr, { $($field:tt)* }, $($arg:tt)* ) => (
        tracing::event!(target: $target, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($field)* }, $($arg)*)
    );
    (target: $target:expr, $($k:ident).+ $($field:tt)* ) => (
        tracing::event!(target: $target, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ $($field)* })
    );
    (target: $target:expr, ?$($k:ident).+ $($field:tt)* ) => (
        tracing::event!(target: $target, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), ?$($k).+ $($field)* })
    );
    (target: $target:expr, %$($k:ident).+ $($field:tt)* ) => (
        tracing::event!(target: $target, tracing::Level::WARN, { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ $($field)* })
    );
    (target: $target:expr, $($arg:tt)+ ) => (
        tracing::event!(target: $target, tracing::Level::WARN, {trace_id = $crate::trace_id!(), span_id = $crate::span_id!() }, $($arg)+)
    );
    ({ $($field:tt)+ }, $($arg:tt)+ ) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($field)+ },
            $($arg)+
        )
    );
    ($($k:ident).+ = $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ = $($field)*}
        )
    );
    (?$($k:ident).+ = $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), ?$($k).+ = $($field)*}
        )
    );
    (%$($k:ident).+ = $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), %$($k).+ = $($field)*}
        )
    );
    ($($k:ident).+, $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+, $($field)*}
        )
    );
    (?$($k:ident).+, $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), ?$($k).+, $($field)*}
        )
    );
    (%$($k:ident).+, $($field:tt)*) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), %$($k).+, $($field)*}
        )
    );
    (?$($k:ident).+) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), ?$($k).+ }
        )
    );
    (%$($k:ident).+) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), %$($k).+ }
        )
    );
    ($($k:ident).+) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!(), $($k).+ }
        )
    );
	($($arg:tt)+) => (
        tracing::event!(
            target: module_path!(),
            tracing::Level::WARN,
            { trace_id = $crate::trace_id!(), span_id = $crate::span_id!() },
            $($arg)+
        )
    );
}

#[cfg(test)]
mod tests {
	use tracing::Level;

	#[test]
	fn warn() {
		warn!(foo = ?3, bar.baz = %2, quux = false);
		warn!(foo = 3, bar.baz = 2, quux = false);
		warn!(foo = 3, bar.baz = 3,);
		warn!("foo");
		warn!("foo: {}", 3);
		warn!(foo = ?3, bar.baz = %2, quux = false, "hello world {:?}", 42);
		warn!(foo = 3, bar.baz = 2, quux = false, "hello world {:?}", 42);
		warn!(foo = 3, bar.baz = 3, "hello world {:?}", 42,);
		warn!({ foo = 3, bar.baz = 80 }, "quux");
		warn!({ foo = 2, bar.baz = 79 }, "quux {:?}", true);
		warn!({ foo = 2, bar.baz = 79 }, "quux {:?}, {quux}", true, quux = false);
		warn!({ foo = 2, bar.baz = 78 }, "quux");
		warn!({ foo = ?2, bar.baz = %78 }, "quux");
		warn!(target: "foo_events", foo = 3, bar.baz = 2, quux = false);
		warn!(target: "foo_events", foo = 3, bar.baz = 3,);
		warn!(target: "foo_events", "foo");
		warn!(target: "foo_events", "foo: {}", 3);
		warn!(target: "foo_events", { foo = 3, bar.baz = 80 }, "quux");
		warn!(target: "foo_events", { foo = 2, bar.baz = 79 }, "quux {:?}", true);
		warn!(target: "foo_events", { foo = 2, bar.baz = 79 }, "quux {:?}, {quux}", true, quux =
		false);
		warn!(target: "foo_events", { foo = 2, bar.baz = 78, }, "quux");
		let foo = 1;
		warn!(?foo);
		warn!(%foo);
		warn!(foo);
		warn!(target: "foo_events", ?foo);
		warn!(target: "foo_events", %foo);
		warn!(target: "foo_events", foo);
		warn!(target: "foo_events", ?foo, true, "message");
		warn!(target: "foo_events", %foo, true, "message");
		warn!(target: "foo_events", foo, true, "message");
	}

	#[test]
	fn warn_inside_span() {
		let span = tracing::span!(Level::WARN, "my span");
		let _enter = span.enter();
		warn();
	}
}
