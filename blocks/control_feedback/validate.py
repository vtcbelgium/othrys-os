"""Dependency-free validator for the JSON Schema subset used by this block.

Supported keywords only. Any other keyword in a schema is an error, so the
contracts can never silently grow semantics the validator does not enforce.
Fails closed: returns a deterministic, sorted list of errors; empty == valid.
"""

import json
import re
from pathlib import Path

SCHEMAS_DIR = Path(__file__).resolve().parent / "schemas"

SUPPORTED_KEYWORDS = frozenset(
    {
        "$schema",
        "$id",
        "title",
        "description",
        "type",
        "const",
        "enum",
        "pattern",
        "minLength",
        "minItems",
        "items",
        "properties",
        "required",
        "additionalProperties",
    }
)


class SchemaError(Exception):
    """The schema itself is unusable."""


def _is_type(value, type_name):
    if type_name == "object":
        return isinstance(value, dict)
    if type_name == "array":
        return isinstance(value, list)
    if type_name == "string":
        return isinstance(value, str)
    if type_name == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if type_name == "boolean":
        return isinstance(value, bool)
    if type_name == "null":
        return value is None
    raise SchemaError("unsupported type in schema: %r" % (type_name,))


def validate(instance, schema, path="$"):
    """Return a list of human-readable errors. Empty list means valid."""
    errors = []

    unsupported = set(schema) - SUPPORTED_KEYWORDS
    if unsupported:
        raise SchemaError(
            "%s: schema uses unsupported keywords: %s" % (path, sorted(unsupported))
        )

    if "type" in schema:
        declared = schema["type"]
        types = declared if isinstance(declared, list) else [declared]
        if not any(_is_type(instance, t) for t in types):
            errors.append("%s: expected type %s" % (path, types))
            return errors

    if "const" in schema and instance != schema["const"]:
        errors.append("%s: expected const %r" % (path, schema["const"]))

    if "enum" in schema and instance not in schema["enum"]:
        errors.append("%s: %r not in enum %s" % (path, instance, schema["enum"]))

    if isinstance(instance, str):
        pattern = schema.get("pattern")
        if pattern is not None and re.search(pattern, instance) is None:
            errors.append("%s: does not match pattern %r" % (path, pattern))
        min_length = schema.get("minLength")
        if min_length is not None and len(instance) < min_length:
            errors.append("%s: shorter than minLength %d" % (path, min_length))

    if isinstance(instance, list):
        min_items = schema.get("minItems")
        if min_items is not None and len(instance) < min_items:
            errors.append("%s: fewer than minItems %d" % (path, min_items))
        item_schema = schema.get("items")
        if item_schema is not None:
            for index, item in enumerate(instance):
                errors.extend(validate(item, item_schema, "%s[%d]" % (path, index)))

    if isinstance(instance, dict):
        for key in schema.get("required", []):
            if key not in instance:
                errors.append("%s: missing required property %r" % (path, key))
        properties = schema.get("properties", {})
        if schema.get("additionalProperties", True) is False:
            for key in sorted(instance):
                if key not in properties:
                    errors.append("%s: unexpected property %r" % (path, key))
        for key in sorted(properties):
            if key in instance:
                errors.extend(
                    validate(instance[key], properties[key], "%s.%s" % (path, key))
                )

    return errors


def load_schema(name):
    """Load one contract by bare name, e.g. 'receipt'."""
    path = SCHEMAS_DIR / ("%s.schema.json" % name)
    if not path.is_file():
        raise SchemaError("no such schema: %s" % path)
    return json.loads(path.read_text(encoding="utf-8"))
