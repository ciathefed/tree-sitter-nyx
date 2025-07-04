/**
 * @file Nyx grammar for tree-sitter
 * @author ciathefed <ciathefed@protonmail.com>
 * @license MIT
 */

const INSTRUCTIONS = caseInsensitive([
  "nop",
  "mov",
  "ldr",
  "str",
  "push",
  "pop",
  "add",
  "sub",
  "mul",
  "div",
  "and",
  "or",
  "xor",
  "shl",
  "shr",
  "cmp",
  "jmp",
  "jeq",
  "jne",
  "jlt",
  "jgt",
  "jle",
  "jge",
  "call",
  "ret",
  "inc",
  "dec",
  "syscall",
  "hlt",
]);

const DIRECTIVES = caseInsensitive([
  "db",
  "resb",
  ".section",
  ".entry",
  ".ascii",
  ".asciz",
]);

const PREPROCESSOR = caseInsensitive([
  "#error",
  "#define",
  "#include",
  "#ifdef",
  "#ifndef",
  "#else",
  "#endif",
]);

const REGISTERS = [
  ...Array.from({ length: 16 }, (_, i) => `b${i}`),
  ...Array.from({ length: 16 }, (_, i) => `w${i}`),
  ...Array.from({ length: 16 }, (_, i) => `d${i}`),
  ...Array.from({ length: 16 }, (_, i) => `q${i}`),
  ...Array.from({ length: 16 }, (_, i) => `ff${i}`),
  ...Array.from({ length: 16 }, (_, i) => `dd${i}`),
];

module.exports = grammar({
  name: "nyx",

  conflicts: ($) => [
    [$.instruction],
    [$.preprocessor_directive],
    [$.directive],
  ],

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.instruction,
        $.label,
        $.directive,
        $.preprocessor_directive,
        $.comment,
      ),

    instruction: ($) =>
      seq(
        field("mnemonic", choice(...INSTRUCTIONS.map((i) => token(i)))),
        optional($.operands),
      ),

    operands: ($) => seq($.operand, repeat(seq(",", $.operand))),

    operand: ($) => choice($.immediate, $.register, $.string, $.identifier),

    register: ($) => choice(...REGISTERS.map((r) => token(r))),

    immediate: ($) => token(choice(/0b[01]+/, /0x[0-9a-fA-F]+/, /\d+/)),

    string: ($) => token(/"[^"]*"/),

    label: ($) => seq($.identifier, ":"),

    directive: ($) =>
      seq(choice(...DIRECTIVES.map((p) => token(p))), optional($.operands)),

    preprocessor_directive: ($) =>
      seq(choice(...PREPROCESSOR.map((p) => token(p))), optional($.operands)),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    comment: ($) => token(seq(";", /.*/)),
  },
});

function caseInsensitive(words) {
  return words.flatMap((w) => [w.toLowerCase(), w.toUpperCase()]);
}
