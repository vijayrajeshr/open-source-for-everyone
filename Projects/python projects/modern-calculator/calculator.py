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
# Modern GUI
# ---------------------------

if _GUI_AVAILABLE:

    class ModernCalculatorUI(ttk.Frame):
        def __init__(self, master: tk.Tk | tk.Widget):
            super().__init__(master, padding=0)
            self.master = master
            self._setup_colors()
            self._make_style()
            self.pack(expand=True, fill=tk.BOTH)
            self._create_widgets()
            self.history: list[str] = []
            self.current_expr = ""

        def _setup_colors(self) -> None:
            """Modern color scheme with dark theme"""
            self.bg_dark = "#1e1e2e"
            self.bg_display = "#2a2a3e"
            self.fg_text = "#e0e0e0"
            self.fg_dim = "#888899"
            self.btn_number = "#3a3a4e"
            self.btn_operator = "#4a4a6e"
            self.btn_function = "#5a5a7e"
            self.btn_equals = "#6366f1"
            self.btn_clear = "#ef4444"
            self.btn_hover = "#505065"
            
        def _make_style(self) -> None:
            style = ttk.Style()
            
            # Configure root background
            self.master.configure(bg=self.bg_dark)
            self.configure(style="Dark.TFrame")
            
            style.configure("Dark.TFrame", background=self.bg_dark)
            
            # Modern button styles with flat design
            style.configure(
                "Modern.TButton",
                background=self.btn_number,
                foreground=self.fg_text,
                borderwidth=0,
                focuscolor='none',
                font=("Segoe UI", 13, "normal"),
                padding=(16, 16)
            )
            
            style.map("Modern.TButton",
                background=[("active", self.btn_hover)],
                foreground=[("active", "#ffffff")]
            )
            
            # Operator buttons
            style.configure(
                "Operator.TButton",
                background=self.btn_operator,
                foreground="#fbbf24",
                font=("Segoe UI", 14, "bold"),
                padding=(16, 16)
            )
            
            style.map("Operator.TButton",
                background=[("active", "#5a5a7e")],
                foreground=[("active", "#fcd34d")]
            )
            
            # Function buttons
            style.configure(
                "Function.TButton",
                background=self.btn_function,
                foreground="#a78bfa",
                font=("Segoe UI", 11),
                padding=(12, 12)
            )
            
            style.map("Function.TButton",
                background=[("active", "#6a6a8e")],
                foreground=[("active", "#c4b5fd")]
            )
            
            # Equals button
            style.configure(
                "Equals.TButton",
                background=self.btn_equals,
                foreground="#ffffff",
                font=("Segoe UI", 16, "bold"),
                padding=(16, 16)
            )
            
            style.map("Equals.TButton",
                background=[("active", "#4f46e5")],
                foreground=[("active", "#ffffff")]
            )
            
            # Clear button
            style.configure(
                "Clear.TButton",
                background=self.btn_clear,
                foreground="#ffffff",
                font=("Segoe UI", 12, "bold"),
                padding=(16, 16)
            )
            
            style.map("Clear.TButton",
                background=[("active", "#dc2626")],
                foreground=[("active", "#ffffff")]
            )

        def _create_widgets(self) -> None:
            # Main container with dark background
            main_container = tk.Frame(self, bg=self.bg_dark)
            main_container.pack(expand=True, fill=tk.BOTH, padx=20, pady=20)
            
            # Display area with modern styling
            display_frame = tk.Frame(main_container, bg=self.bg_display, 
                                    highlightthickness=0)
            display_frame.pack(fill=tk.X, pady=(0, 20))
            
            # Expression label (shows what you're typing)
            self.expr_var = tk.StringVar()
            expr_label = tk.Label(
                display_frame,
                textvariable=self.expr_var,
                bg=self.bg_display,
                fg=self.fg_dim,
                font=("Segoe UI", 12),
                anchor="e"
            )
            expr_label.pack(fill=tk.X, padx=20, pady=(15, 5))
            
            # Result display
            self.display_var = tk.StringVar(value="0")
            result_label = tk.Label(
                display_frame,
                textvariable=self.display_var,
                bg=self.bg_display,
                fg=self.fg_text,
                font=("Segoe UI", 32, "bold"),
                anchor="e"
            )
            result_label.pack(fill=tk.X, padx=20, pady=(5, 15))
            
            # Bind keyboard shortcuts to the main window
            self.master.bind("<Key>", self._on_keypress)
            self.master.focus_set()
            
            # Button grid with modern layout
            button_frame = tk.Frame(main_container, bg=self.bg_dark)
            button_frame.pack(expand=True, fill=tk.BOTH)
            
            # Scientific function row
            sci_buttons = [
                ("sin", "sin(", "Function.TButton"),
                ("cos", "cos(", "Function.TButton"),
                ("tan", "tan(", "Function.TButton"),
                ("√", "sqrt(", "Function.TButton"),
            ]
            
            for col, (label, action, style) in enumerate(sci_buttons):
                btn = tk.Button(
                    button_frame,
                    text=label,
                    command=lambda a=action: self._on_press(a),
                    bg=self.btn_function,
                    fg="#a78bfa",
                    font=("Segoe UI", 11),
                    bd=0,
                    activebackground="#6a6a8e",
                    activeforeground="#c4b5fd",
                    cursor="hand2"
                )
                btn.grid(row=0, column=col, sticky="nsew", padx=3, pady=3)
            
            # Main calculator buttons
            buttons = [
                ("C", "C", "Clear.TButton"),
                ("(", "(", "Function.TButton"),
                (")", ")", "Function.TButton"),
                ("÷", "/", "Operator.TButton"),
                
                ("7", "7", "Modern.TButton"),
                ("8", "8", "Modern.TButton"),
                ("9", "9", "Modern.TButton"),
                ("×", "*", "Operator.TButton"),
                
                ("4", "4", "Modern.TButton"),
                ("5", "5", "Modern.TButton"),
                ("6", "6", "Modern.TButton"),
                ("−", "-", "Operator.TButton"),
                
                ("1", "1", "Modern.TButton"),
                ("2", "2", "Modern.TButton"),
                ("3", "3", "Modern.TButton"),
                ("+", "+", "Operator.TButton"),
                
                ("±", "neg", "Function.TButton"),
                ("0", "0", "Modern.TButton"),
                (".", ".", "Modern.TButton"),
                ("=", "equal", "Equals.TButton"),
            ]
            
            r, c = 1, 0
            for label, action, style in buttons:
                if style == "Modern.TButton":
                    bg = self.btn_number
                    fg = self.fg_text
                    font = ("Segoe UI", 13)
                elif style == "Operator.TButton":
                    bg = self.btn_operator
                    fg = "#fbbf24"
                    font = ("Segoe UI", 14, "bold")
                elif style == "Function.TButton":
                    bg = self.btn_function
                    fg = "#a78bfa"
                    font = ("Segoe UI", 11)
                elif style == "Equals.TButton":
                    bg = self.btn_equals
                    fg = "#ffffff"
                    font = ("Segoe UI", 16, "bold")
                elif style == "Clear.TButton":
                    bg = self.btn_clear
                    fg = "#ffffff"
                    font = ("Segoe UI", 12, "bold")
                else:
                    bg = self.btn_number
                    fg = self.fg_text
                    font = ("Segoe UI", 13)
                
                btn = tk.Button(
                    button_frame,
                    text=label,
                    command=lambda a=action: self._on_press(a),
                    bg=bg,
                    fg=fg,
                    font=font,
                    bd=0,
                    activebackground=self.btn_hover,
                    cursor="hand2"
                )
                btn.grid(row=r, column=c, sticky="nsew", padx=3, pady=3)
                c += 1
                if c > 3:
                    c = 0
                    r += 1
            
            # Configure grid weights for responsive layout
            for i in range(6):
                button_frame.rowconfigure(i, weight=1)
            for i in range(4):
                button_frame.columnconfigure(i, weight=1)

        def _on_press(self, action: str) -> None:
            if action == "C":
                self.current_expr = ""
                self.expr_var.set("")
                self.display_var.set("0")
                return
                
            if action == "neg":
                if self.current_expr and self.current_expr[-1].isdigit():
                    # Toggle sign of last number
                    parts = self.current_expr.rstrip("0123456789.")
                    num = self.current_expr[len(parts):]
                    if num:
                        if num.startswith("-"):
                            self.current_expr = parts + num[1:]
                        else:
                            self.current_expr = parts + "-" + num
                        self.expr_var.set(self.current_expr)
                return
                
            if action == "equal":
                self._on_equal()
                return
                
            # Add to expression
            self.current_expr += action
            self.expr_var.set(self.current_expr)

        def _on_keypress(self, event: tk.Event) -> Optional[str]:
            key = event.keysym
            char = event.char

            if key in ("Return", "KP_Enter"):
                self._on_equal()
                return "break"

            if key == "Escape":
                self._on_press("C")
                return "break"

            if key == "BackSpace":
                if self.current_expr:
                    self.current_expr = self.current_expr[:-1]
                    self.expr_var.set(self.current_expr)
                return "break"

            # Map keys to calculator functions
            key_map = {
                '*': '*',
                '/': '/',
                '+': '+',
                '-': '-',
                '(': '(',
                ')': ')',
                '.': '.',
            }
            
            if char in "0123456789":
                self._on_press(char)
                return "break"
            elif char in key_map:
                self._on_press(key_map[char])
                return "break"

            return "break"

        def _on_equal(self) -> None:
            if not self.current_expr:
                return
                
            try:
                result = evaluate_expression(self.current_expr)
                out = str(int(result)) if result.is_integer() else f"{result:.8f}".rstrip('0').rstrip('.')
                self.history.append(f"{self.current_expr} = {out}")
                self.display_var.set(out)
                self.current_expr = out
                self.expr_var.set("")
            except CalcError:
                self._show_error()

        def _show_error(self) -> None:
            self.display_var.set("Error")
            self.expr_var.set("")
            self.after(1500, lambda: self.display_var.set("0"))
            self.current_expr = ""


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
        root.geometry("440x680")
        root.resizable(False, False)
        ModernCalculatorUI(root)
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
            