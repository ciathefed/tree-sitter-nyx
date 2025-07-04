/**
 * @file Nyx grammar for tree-sitter
 * @author ciathefed <ciathefed@protonmail.com>
 * @license MIT
 */

module.exports = grammar({
  name: "nyx",

  conflicts: ($) => [[$.assembler_directive], [$.preprocessor_directive]],

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.instruction,
        $.label,
        $.assembler_directive,
        $.preprocessor_directive,
        $.comment,
      ),

    instruction: ($) =>
      seq(
        field("opcode", $.identifier),
        optional(seq(",", sep1(",", $.operand))),
      ),

    label: ($) => seq($.identifier, ":"),

    assembler_directive: ($) =>
      seq(".", field("name", $.identifier), optional($.operand)),
    preprocessor_directive: ($) =>
      seq("#", field("name", $.identifier), optional($.operand)),

    operand: ($) =>
      choice(
        $.register,
        $.immediate,
        $.string,
        $.memory_reference,
        $.identifier,
      ),

    register: ($) =>
      /b[0-9]+|w[0-9]+|d[0-9]+|q[0-9]+|ff[0-9]+|dd[0-9]+|ip|sp|bp/,
    immediate: ($) => choice(/0x[0-9a-fA-F]+/, /0b[01]+/, /[0-9]+/),
    string: ($) => /"([^"\\]|\\.)*"/,
    memory_reference: ($) =>
      seq("[", $.operand, optional(seq(",", $.operand)), "]"),
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    comment: ($) => /;.*/,
  },
});

function sep1(separator, rule) {
  return seq(rule, repeat(seq(separator, rule)));
}
