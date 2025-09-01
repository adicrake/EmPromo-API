const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON
app.use(express.json());

// Caminho do arquivo de dados
const DATA_FILE = path.join(__dirname, "data.json");

// Endpoint inicial
app.get("/", (req, res) => {
  res.json({ ok: true, service: "EmPromo API", now: new Date() });
});

// Endpoint para listar promoções
app.get("/promocoes", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
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

// Endpoint para adicionar nova promoção
app.post("/promocoes", (req, res) => {
  const novaPromocao = req.body;

  if (!novaPromocao.nome || !novaPromocao.precoMedio || !novaPromocao.precoPromocao) {
    return res.status(400).json({ error: "Dados incompletos da promoção" });
  }

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    let promocoes = [];
    if (!err) {
      try {
        promocoes = JSON.parse(data);
      } catch {}
    }

    promocoes.push(novaPromocao);

    fs.writeFile(DATA_FILE, JSON.stringify(promocoes, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao salvar promoção" });
      }
      res.status(201).json({ message: "Promoção adicionada com sucesso!" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
