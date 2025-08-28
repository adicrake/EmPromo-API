import express from "express";
import fs from "fs";

const app = express();

// Rota principal (status da API)
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "EmPromo API",
    now: new Date().toISOString(),
  });
});

// 📌 Rota para devolver promoções
app.get("/promocoes", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Erro ao ler promoções" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Configuração do Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ EmPromo API rodando na porta ${port}`);
});
