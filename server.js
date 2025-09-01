const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // permite receber JSON no body

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
      const promocoes = JSON.parse(data || "[]");
      res.json(promocoes);
    } catch (e) {
      res.status(500).json({ error: "Erro ao processar promoções" });
    }
  });
});

// Endpoint para adicionar promoção
app.post("/promocoes", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao ler promoções" });

    let promocoes = [];
    try {
      promocoes = JSON.parse(data || "[]");
    } catch (e) {
      promocoes = [];
    }

    promocoes.push(req.body); // adiciona nova promoção enviada pelo admin

    fs.writeFile("data.json", JSON.stringify(promocoes, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Erro ao salvar promoção" });
      res.json({ ok: true, message: "Promoção adicionada com sucesso!" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
