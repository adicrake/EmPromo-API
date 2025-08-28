const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint inicial
app.get("/", (req, res) => {
  res.json({ ok: true, service: "EmPromo API", now: new Date() });
});

// Endpoint para listar promoções
app.get("/promocoes", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao ler promoções" });
    }
    try {
      const promocoes = JSON.parse(data);
      res.json(promocoes);
    } catch (e) {
      res.status(500).json({ error: "Erro ao processar promoções" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
