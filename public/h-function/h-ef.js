function evaluateFormula(formula, rowData) {
  try {
    let expr = formula.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
      const val = rowData[match];
      return isNaN(val) ? `"${val}"` : parseFloat(val);
    });

    if (expr.startsWith('=')) expr = expr.substring(1);

    // Use Function constructor instead of eval for better sandboxing
    return Function('"use strict";return (' + expr + ')')();
  } catch (e) {
    throw new Error("Invalid formula");
  }
}