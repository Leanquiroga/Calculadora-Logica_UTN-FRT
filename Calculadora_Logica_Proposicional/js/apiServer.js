import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "TU_API_Key"; // Asegúrate de reemplazar esto con tu clave de API
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

document.querySelectorAll(".btn-operator").forEach((button) => {
  const operator = button.innerText;
  button.addEventListener("click", async () => {
    if (operator === "Calcular") {
      const proposition1 = document.getElementById("proposition1").value;
      const proposition2 = document.getElementById("proposition2").value;
      const expression = document.getElementById("input3").value;
      const prompt = `Analizar las proposiciones "${proposition1}" (p) y "${proposition2}" con la fórmula "${expression}". Solo quiero la respuesta.`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        document.getElementById("resultIA").innerText = text;
      } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerText =
          "Error: Model evaluation failed.";
      }
    }
  });
});
