from __future__ import annotations

import ast
import operator
import math
import sys
from typing import Any, Dict, Callable, Optional

# Optional Tkinter GUI
try:
    import tkinter as tk
    from tkinter import ttk

    _GUI_AVAILABLE = True
except Exception:
    tk = None  # type: ignore
    ttk = None  # type: ignore
    _GUI_AVAILABLE = False


# ---------------------------
# Functional core
# ---------------------------

_OPERATORS: Dict[type, Callable[[Any, Any], Any]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
}

_MATH_FUNCS: Dict[str, Callable[..., Any]] = {
    "sqrt": math.sqrt,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "log": math.log,
    "ln": math.log,
    "log10": math.log10,
    "abs": abs,
    "pow": math.pow,
}


class CalcError(Exception):
    """Raised for calculator evaluation errors."""


def _eval_node(node: ast.AST) -> float:
    if isinstance(node, ast.Expression):
        return _eval_node(node.body)

    if isinstance(node, ast.Num):  # Py <3.8
        return node.n
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise CalcError("Unsupported constant")

    if isinstance(node, ast.BinOp):
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        op_type = type(node.op)
        if op_type in _OPERATORS:
            try:
                return _OPERATORS[op_type](left, right)
            except Exception as e:
                raise CalcError(str(e))
        raise CalcError("Unsupported binary operator")

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type in _OPERATORS:
            return _OPERATORS[op_type](_eval_node(node.operand))
        raise CalcError("Unsupported unary operator")

    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name in _MATH_FUNCS:
                args = [_eval_node(arg) for arg in node.args]
                try:
                    return _MATH_FUNCS[func_name](*args)
                except Exception as e:
                    raise CalcError(str(e))
        raise CalcError("Unsupported function call")

    if isinstance(node, ast.Name):
        if node.id == "pi":
            return math.pi
        if node.id == "e":
            return math.e
        raise CalcError(f"Unknown identifier: {node.id}")

    raise CalcError("Unsupported expression")


def evaluate_expression(expr: str) -> float:
    if not expr or expr.strip() == "":
        raise CalcError("Empty expression")

    expr = expr.replace("×", "*").replace("÷", "/").replace("−", "-")

    try:
        parsed = ast.parse(expr, mode="eval")
    except SyntaxError as e:
        raise CalcError("Syntax error") from e

    for node in ast.walk(parsed):
        if isinstance(
            node,
            (
                ast.Import,
                ast.ImportFrom,
                ast.Global,
                ast.Nonlocal,
                ast.Lambda,
                ast.IfExp,
            ),
        ):
            raise CalcError("Disallowed expression")

    return float(_eval_node(parsed))


# ---------------------------
# GUI
# ---------------------------

if _GUI_AVAILABLE:

    class CalculatorUI(ttk.Frame):
        def __init__(self, master: tk.Tk | tk.Widget):
            super().__init__(master, padding=12)
            self.master = master
            self._make_style()
            self.pack(expand=True, fill=tk.BOTH)
            self._create_widgets()
            self.history: list[str] = []

        def _make_style(self) -> None:
            style = ttk.Style()
            try:
                style.theme_use("clam")
            except Exception:
                pass
            style.configure("TButton", font=("Segoe UI", 12), padding=8)
            style.configure("Display.TEntry", font=("Segoe UI", 18))

        def _create_widgets(self) -> None:
            self.display_var = tk.StringVar()
            self.display = ttk.Entry(
                self,
                textvariable=self.display_var,
                justify="right",
                style="Display.TEntry",
            )
            self.display.grid(row=0, column=0, columnspan=4, sticky="nsew", pady=(0, 8))

            # Bind key events to Entry only
            self.display.bind("<Key>", self._on_keypress)

            buttons = [
                ("C", "C"),
                ("←", "back"),
                ("%", "%"),
                ("÷", "/"),
                ("7", "7"),
                ("8", "8"),
                ("9", "9"),
                ("×", "*"),
                ("4", "4"),
                ("5", "5"),
                ("6", "6"),
                ("−", "-"),
                ("1", "1"),
                ("2", "2"),
                ("3", "3"),
                ("+", "+"),
                ("±", "neg"),
                ("0", "0"),
                (".", "."),
                ("=", "equal"),
            ]

            r, c = 1, 0
            for label, action in buttons:
                ttk.Button(
                    self, text=label, command=lambda a=action: self._on_press(a)
                ).grid(row=r, column=c, sticky="nsew", padx=4, pady=4)
                c += 1
                if c > 3:
                    c = 0
                    r += 1

            for i in range(6):
                self.rowconfigure(i, weight=1)
            for i in range(4):
                self.columnconfigure(i, weight=1)

        # Insert text at cursor position
        def _insert_text(self, text: str) -> None:
            pos = int(self.display.index(tk.INSERT))
            self.display.insert(pos, text)

        # Delete character before cursor
        def _delete_back(self) -> None:
            pos = int(self.display.index(tk.INSERT))
            if pos > 0:
                self.display.delete(pos - 1, pos)

        def _on_press(self, action: str) -> None:
            if action == "C":
                self.display_var.set("")
                self.display.icursor(tk.END)
                return
            if action == "back":
                self._delete_back()
                return
            if action == "neg":
                text = self.display_var.get()
                if text.startswith("-"):
                    self.display_var.set(text[1:])
                else:
                    self.display_var.set("-" + text)
                self.display.icursor(tk.END)
                return
            if action == "equal":
                self._on_equal()
                return
            self._insert_text(action)

        def _on_keypress(self, event: tk.Event) -> Optional[str]:
            key = event.keysym
            char = event.char

            # Enter evaluates
            if key in ("Return", "KP_Enter"):
                self._on_equal()
                return "break"

            # Escape clears
            if key == "Escape":
                self.display_var.set("")
                return "break"

            # Allow navigation keys
            if key in (
                "Left", "Right", "Up", "Down",
                "Home", "End", "Tab",
                "Shift_L", "Shift_R",
                "Control_L", "Control_R"
            ):
                return None

            # Allow Backspace/Delete default behavior
            if key in ("BackSpace", "Delete"):
                return None

            # Only allow calculator characters
            allowed = "0123456789.+-*/()%"
            if char in allowed:
                self._insert_text(char)
                return "break"

            # Block all other characters
            return "break"

        def _on_equal(self) -> None:
            expr = self.display_var.get()
            try:
                result = evaluate_expression(expr)
            except CalcError:
                self._show_error("Error")
                return
            out = str(int(result)) if result.is_integer() else str(result)
            self.history.append(f"{expr} = {out}")
            self.display_var.set(out)
            self.display.icursor(tk.END)

        def _show_error(self, msg: str) -> None:
            self.display_var.set("Error")
            self.after(1000, lambda: self.display_var.set(""))


# ---------------------------
# CLI
# ---------------------------

def _evaluate_lines(lines: list[str]) -> None:
    for line in lines:
        s = line.strip()
        if not s:
            continue
        try:
            print(evaluate_expression(s))
        except CalcError as e:
            print("Error:", e)


def cli_repl(non_interactive_fallback: Optional[list[str]] = None) -> None:
    if non_interactive_fallback:
        _evaluate_lines(non_interactive_fallback)
        return

    try:
        if not sys.stdin.isatty():
            data = sys.stdin.read()
            if data:
                _evaluate_lines(data.splitlines())
                return
    except Exception:
        pass

    if sys.stdin.isatty():
        print("Calculator CLI. Type 'quit' or 'exit' to leave.")
        while True:
            try:
                expr = input("> ")
            except (EOFError, KeyboardInterrupt, OSError):
                print()
                return

            if expr is None:
                return
            if expr.lower().strip() in ("quit", "exit"):
                return

            expr = expr.strip()
            if not expr:
                continue

            try:
                print(evaluate_expression(expr))
            except CalcError as e:
                print("Error:", e)
        return

    print("No interactive stdin available and no expressions provided.")


# ---------------------------
# Tests
# ---------------------------

import unittest


class TestEvaluateExpression(unittest.TestCase):
    def test_simple_add(self):
        self.assertEqual(evaluate_expression("2+3"), 5.0)

    def test_precedence(self):
        self.assertEqual(evaluate_expression("2+3*4"), 14.0)

    def test_parentheses(self):
        self.assertEqual(evaluate_expression("(2+3)*4"), 20.0)

    def test_functions(self):
        self.assertEqual(evaluate_expression("sqrt(25)"), 5.0)

    def test_pow_operator_and_func(self):
        self.assertEqual(evaluate_expression("2**3"), 8.0)
        self.assertEqual(evaluate_expression("pow(2,3)"), 8.0)

    def test_pi_constant(self):
        self.assertAlmostEqual(evaluate_expression("pi"), math.pi)

    def test_unary_minus(self):
        self.assertEqual(evaluate_expression("-5 + 2"), -3.0)

    def test_invalid_syntax(self):
        with self.assertRaises(CalcError):
            evaluate_expression("2+*3")

    def test_disallowed_name(self):
        with self.assertRaises(CalcError):
            evaluate_expression('__import__("os")')

    def test_empty(self):
        with self.assertRaises(CalcError):
            evaluate_expression("")

    def test_modulo(self):
        self.assertEqual(evaluate_expression("10 % 3"), 1.0)

    def test_log10(self):
        self.assertAlmostEqual(evaluate_expression("log10(100)"), 2.0)

    def test_sin_zero(self):
        self.assertAlmostEqual(evaluate_expression("sin(0)"), 0.0)

    def test_abs(self):
        self.assertEqual(evaluate_expression("abs(-7)"), 7.0)


def run_tests() -> int:
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestEvaluateExpression)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    return 0 if result.wasSuccessful() else 1


# ---------------------------
# Entrypoint
# ---------------------------

def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]

    if "--run-tests" in argv:
        return run_tests()

    if "--eval" in argv:
        try:
            expr = argv[argv.index("--eval") + 1]
        except Exception:
            print("Usage: --eval 'EXPR'")
            return 1
        try:
            print(evaluate_expression(expr))
            return 0
        except CalcError as e:
            print("Error:", e)
            return 1

    if "--cli" in argv:
        idx = argv.index("--cli")
        fallback = argv[idx + 1 :]
        cli_repl(fallback or None)
        return 0

    if _GUI_AVAILABLE and "--no-gui" not in argv:
        root = tk.Tk()
        root.title("Modern Calculator")
        root.geometry("400x520")
        CalculatorUI(root)
        try:
            root.mainloop()
        except KeyboardInterrupt:
            pass
        return 0

    if not _GUI_AVAILABLE:
        if not sys.stdin.isatty():
            print("Non-interactive environment detected. Running tests by default.")
            return run_tests()
        print("tkinter not available; starting CLI fallback.")
        cli_repl()
        return 0

    return 0


if __name__ == "__main__":
    try:
        ret_code = main()
    except SystemExit as e:
        code = getattr(e, "code", None)
        if code and code != 0:
            raise
    else:
        if ret_code != 0:
            sys.exit(ret_code)
