document.addEventListener("DOMContentLoaded", () => {
  const selectContainer = document.querySelector(".row.mb-3");
  const addVariableButton = document.getElementById("addVariable");
  const input3 = document.getElementById("input3");
  const output1 = document.getElementById("output1");
  const truthTable = document.getElementById("truthTable");
  let variableCount = 2;
  const variableNames = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

  const precedence = { "¬": 3, "∧": 2, "∨": 2, "→": 1, "←": 1, "↔": 1 };
  const validChars = /^[pqrstuvwxyz¬∧∨→←↔() ]+$/;

  function appendToExpression(text) {
    input3.value += text;
  }

  function isValidExpression(expression) {
    if (!validChars.test(expression)) {
      throw new Error("Expresión contiene caracteres no válidos.");
    }
    return true;
  }

  function parseExpression(expression, variables) {
    const stack = [];
    const operators = [];

    function applyOperator(operator) {
      if (operator === "¬") {
        const operand = stack.pop();
        stack.push(!operand);
      } else {
        const right = stack.pop();
        const left = stack.pop();
        switch (operator) {
          case "∧":
            stack.push(left && right);
            break;
          case "∨":
            stack.push(left || right);
            break;
          case "→":
            stack.push(!left || right);
            break;
          case "←":
            stack.push(left || !right);
            break;
          case "↔":
            stack.push(left === right);
            break;
        }
      }
    }

    for (const char of expression) {
      if (char === " ") continue;
      if (variables.hasOwnProperty(char)) {
        stack.push(variables[char]);
      } else if (char in precedence) {
        while (
          operators.length &&
          precedence[operators[operators.length - 1]] >= precedence[char]
        ) {
          applyOperator(operators.pop());
        }
        operators.push(char);
      } else if (char === "(") {
        operators.push(char);
      } else if (char === ")") {
        while (operators.length && operators[operators.length - 1] !== "(") {
          applyOperator(operators.pop());
        }
        operators.pop();
      }
    }
    while (operators.length) {
      applyOperator(operators.pop());
    }
    return stack.pop();
  }

  function evaluateExpression() {
    const expression = input3.value;
    try {
      isValidExpression(expression);
    } catch (error) {
      output1.value = error.message;
      return;
    }

    const variables = {};
    document.querySelectorAll(".form-select").forEach((select, index) => {
      const variableName = variableNames[index];
      variables[variableName] = select.value === "true";
    });

    try {
      const result = parseExpression(expression, variables);
      output1.value = result ? "Verdadero" : "Falso";
      generateTruthTable();
    } catch (error) {
      output1.value = "Error en la expresión";
    }
  }

  function generateTruthTable() {
    const expression = input3.value;
    const table = document.createElement("table");
    table.classList.add("table", "table-bordered");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headRow = document.createElement("tr");
    const selectedVariables = Array.from(
      document.querySelectorAll(".form-select")
    ).map((_, index) => variableNames[index]);
    selectedVariables.forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headRow.appendChild(th);
    });
    const thResult = document.createElement("th");
    thResult.textContent = "Resultado";
    headRow.appendChild(thResult);
    thead.appendChild(headRow);

    const combinations = generateCombinations(selectedVariables.length);

    combinations.forEach((combination) => {
      const row = document.createElement("tr");
      const vars = {};
      selectedVariables.forEach((variable, index) => {
        vars[variable] = combination[index];
      });
      const result = parseExpression(expression, vars);
      combination.concat(result ? "Verdadero" : "Falso").forEach((text) => {
        const td = document.createElement("td");
        td.textContent = text;
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    truthTable.innerHTML = "";
    truthTable.appendChild(table);
  }

  function generateCombinations(length) {
    const combinations = [];
    const numCombinations = Math.pow(2, length);

    for (let i = 0; i < numCombinations; i++) {
      const combination = [];
      for (let j = 0; j < length; j++) {
        combination.push(!!(i & (1 << (length - j - 1))));
      }
      combinations.push(combination);
    }

    combinations.sort((a, b) => {
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return b[i] - a[i];
        }
      }
      return 0;
    });

    return combinations;
  }

  function clearAllFields() {
    const selectElements = document.querySelectorAll(".form-select");
    selectElements.forEach((select, index) => {
      if (index > 1) {
        select.parentElement.remove();
      } else {
        select.value = "false";
      }
    });
    variableCount = 2;
    input3.value = "";
    output1.value = "";
    truthTable.innerHTML = "";
  }

  function addVariableSelector(variableName) {
    const col = document.createElement("div");
    col.className = "col";
    const label = document.createElement("label");
    label.textContent = `Valor de ${variableName}`;
    label.setAttribute("for", `select${variableCount + 1}`);
    const select = document.createElement("select");
    select.className = "form-select";
    select.id = `select${variableCount + 1}`;
    select.innerHTML = `
            <option value="true">true</option>
            <option value="false" selected>false</option>
        `;
    col.appendChild(label);
    col.appendChild(select);
    addVariableButton.parentElement.insertAdjacentElement("beforebegin", col);
  }

  document.querySelectorAll(".btn-operator").forEach((button) => {
    const operator = button.innerText;
    button.addEventListener("click", () => {
      if (operator === "Calcular") {
        evaluateExpression();
      } else if (operator === "Limpiar Todo") {
        clearAllFields();
      } else {
        appendToExpression(operator);
      }
    });
  });

  addVariableButton.addEventListener("click", () => {
    if (variableCount < variableNames.length) {
      addVariableSelector(variableNames[variableCount]);
      variableCount++;
    }
  });
});
