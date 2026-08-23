"""Secret guard. A receipt that looks like it carries a credential is refused.

Deterministic denylist. No network, no entropy heuristics, no exceptions list.
False positives fail the write closed; that is the intended direction.
"""

import re

PATTERNS = (
    ("github-pat", r"gh[pousr]_[A-Za-z0-9]{20,}"),
    ("github-fine-grained-pat", r"github_pat_[A-Za-z0-9_]{20,}"),
    ("aws-access-key-id", r"AKIA[0-9A-Z]{16}"),
    ("private-key-block", r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    ("slack-token", r"xox[abprs]-[A-Za-z0-9-]{10,}"),
    ("authorization-header", r"(?i)authorization[\"']?\s*[:=]\s*[\"']?(bearer|basic)\s+\S{8,}"),
    ("assigned-credential", r"(?i)\b(password|passwd|secret|api[_-]?key|access[_-]?token)\b[\"']?\s*[:=]\s*[\"']?[^\s\"',}]{8,}"),
)


class SecretDetected(Exception):
    """A credential-shaped string reached the receipt writer."""


def scan(text):
    """Return a sorted list of pattern names that matched."""
    return sorted({name for name, pattern in PATTERNS if re.search(pattern, text)})


def assert_clean(text):
    hits = scan(text)
    if hits:
        raise SecretDetected("credential-shaped content refused: %s" % ", ".join(hits))
