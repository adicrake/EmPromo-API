const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Rota inicial (teste)
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "EmPromo API",
    now: new Date(),
  });
});

// Rota de promoções
app.get("/promocoes", (req, res) => {
  const filePath = path.join(__dirname, "data.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao ler promoções" });
    }

    try {
      const promocoes = JSON.parse(data).map((item) => {
        const desconto =
          ((item.precoMedio - item.precoPromocao) / item.precoMedio) * 100;

        return {
          ...item,
          desconto: desconto.toFixed(1) + "%",
        };
      });

      res.json(promocoes);
    } catch (parseError) {
      res.status(500).json({ error: "Erro ao processar promoções" });
    }
  });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
